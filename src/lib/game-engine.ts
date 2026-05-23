import { v4 as uuidv4 } from 'uuid'
import type {
  GameState,
  Player,
  Question,
  EliminationEvent,
  RoundResult,
} from '@/types/game'

// ---------------------------------------------------------------------------
// In-memory storage (single process – scales with Redis pub/sub if needed)
// ---------------------------------------------------------------------------
const games = new Map<string, InternalGameState>()
const playerToGame = new Map<string, string>()             // playerId  -> roomCode
const socketToPlayer = new Map<string, { playerId: string; roomCode: string }>() // socketId -> { playerId, roomCode }

// ---------------------------------------------------------------------------
// Internal game state (extends public GameState with server-only fields)
// ---------------------------------------------------------------------------
export interface InternalGameState extends GameState {
  hostSocketId: string
  roundAnswers: Map<string, string>   // playerId -> submitted answer
  timerRef: NodeJS.Timeout | null
  questionQueue: Question[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  io: any                             // Socket.IO server reference
}

// ---------------------------------------------------------------------------
// Room code generation
// ---------------------------------------------------------------------------
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ---------------------------------------------------------------------------
// Game lifecycle
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createGame(hostSocketId: string, io: any): InternalGameState {
  let roomCode: string
  do {
    roomCode = generateRoomCode()
  } while (games.has(roomCode))

  const game: InternalGameState = {
    roomCode,
    hostSocketId,
    status: 'waiting',
    players: {},
    currentRound: 0,
    totalRounds: 0,
    currentQuestion: null,
    timeRemaining: 0,
    timeLimit: 30,
    roundResults: null,
    winner: null,
    eliminationFeed: [],
    roundAnswers: new Map(),
    timerRef: null,
    questionQueue: [],
    io,
  }

  games.set(roomCode, game)
  return game
}

export function getGame(roomCode: string): InternalGameState | null {
  return games.get(roomCode) ?? null
}

export function getGameByPlayerId(playerId: string): InternalGameState | null {
  const roomCode = playerToGame.get(playerId)
  if (!roomCode) return null
  return games.get(roomCode) ?? null
}

export function getGameBySocketId(socketId: string): InternalGameState | null {
  const info = socketToPlayer.get(socketId)
  if (!info) return null
  return games.get(info.roomCode) ?? null
}

export function getPlayerIdBySocketId(socketId: string): string | null {
  return socketToPlayer.get(socketId)?.playerId ?? null
}

// ---------------------------------------------------------------------------
// Player management
// ---------------------------------------------------------------------------
export function addPlayer(
  game: InternalGameState,
  nickname: string,
  socketId: string
): Player {
  const id = uuidv4()
  const player: Player = {
    id,
    nickname,
    socketId,
    status: 'active',
    score: 0,
    rank: null,
    answeredThisRound: false,
  }

  game.players[id] = player
  playerToGame.set(id, game.roomCode)
  socketToPlayer.set(socketId, { playerId: id, roomCode: game.roomCode })
  return player
}

export function reconnectPlayer(
  game: InternalGameState,
  playerId: string,
  newSocketId: string
): Player | null {
  const player = game.players[playerId]
  if (!player) return null

  // Remove old socket mapping if it exists
  if (player.socketId) {
    socketToPlayer.delete(player.socketId)
  }

  player.socketId = newSocketId
  socketToPlayer.set(newSocketId, { playerId, roomCode: game.roomCode })
  return player
}

export function disconnectPlayer(
  socketId: string
): { game: InternalGameState; player: Player } | null {
  const info = socketToPlayer.get(socketId)
  if (!info) return null

  const game = games.get(info.roomCode)
  if (!game) return null

  const player = game.players[info.playerId]
  if (!player) return null

  // Mark socket as gone but keep player in game (allow reconnect)
  player.socketId = null
  socketToPlayer.delete(socketId)

  return { game, player }
}

// ---------------------------------------------------------------------------
// Question management
// ---------------------------------------------------------------------------
export function setQuestions(game: InternalGameState, questions: Question[]): void {
  // Pre-sorted by difficulty (caller should ensure this, but sort defensively)
  game.questionQueue = [...questions].sort((a, b) => a.difficulty - b.difficulty)
  game.totalRounds = game.questionQueue.length
}

// ---------------------------------------------------------------------------
// Round management
// ---------------------------------------------------------------------------
export function startRound(
  game: InternalGameState,
  onTick: (timeRemaining: number) => void,
  onEnd: () => void
): Question | null {
  const question = game.questionQueue[game.currentRound]
  if (!question) return null

  game.currentRound++
  game.currentQuestion = question
  game.status = 'question'
  game.roundResults = null

  // Scale time limit with difficulty
  game.timeRemaining =
    question.difficulty <= 2 ? 20 :
    question.difficulty <= 3 ? 25 :
    30

  game.timeLimit = game.timeRemaining
  game.roundAnswers = new Map()

  // Reset per-round player state
  for (const player of Object.values(game.players)) {
    if (player.status === 'active') {
      player.answeredThisRound = false
      player.hasAnsweredCorrectly = undefined
    }
  }

  // Clear any existing timer before starting a new one
  if (game.timerRef) {
    clearInterval(game.timerRef)
    game.timerRef = null
  }

  game.timerRef = setInterval(() => {
    game.timeRemaining--
    onTick(game.timeRemaining)

    if (game.timeRemaining <= 0) {
      if (game.timerRef) {
        clearInterval(game.timerRef)
        game.timerRef = null
      }
      onEnd()
    }
  }, 1000)

  return question
}

/**
 * Records a player's answer for the current round.
 * Returns true if ALL active players have now submitted (triggers early round end).
 */
export function submitAnswer(
  game: InternalGameState,
  playerId: string,
  answer: string
): boolean {
  const player = game.players[playerId]
  if (!player || player.status !== 'active' || player.answeredThisRound) {
    return false
  }

  player.answeredThisRound = true
  game.roundAnswers.set(playerId, answer)

  // Check if all active players have now answered
  const activePlayers = Object.values(game.players).filter(p => p.status === 'active')
  return activePlayers.every(p => p.answeredThisRound)
}

/**
 * Grades all answers, applies eliminations, and returns the round result.
 * Safe to call multiple times – idempotent if status is already 'results'.
 */
export function endRound(game: InternalGameState): RoundResult {
  // Stop the timer
  if (game.timerRef) {
    clearInterval(game.timerRef)
    game.timerRef = null
  }

  game.status = 'results'
  const correctAnswer = game.currentQuestion!.answer

  const activePlayers = Object.values(game.players).filter(p => p.status === 'active')
  const correctPlayers: Player[] = []
  const wrongPlayers: Player[] = []

  for (const player of activePlayers) {
    const submitted = game.roundAnswers.get(player.id)
    if (submitted === correctAnswer) {
      player.hasAnsweredCorrectly = true
      // Award points: base 100 + time bonus (up to 150 extra)
      const timeBonus = Math.round((game.timeRemaining / game.timeLimit) * 150)
      player.score += 100 + timeBonus
      correctPlayers.push(player)
    } else {
      player.hasAnsweredCorrectly = false
      wrongPlayers.push(player)
    }
  }

  // Mercy rule: if NOBODY answered correctly, no one is eliminated this round
  if (correctPlayers.length === 0 && activePlayers.length > 0) {
    for (const player of activePlayers) {
      player.hasAnsweredCorrectly = false
    }

    const result: RoundResult = {
      correctAnswer,
      explanation: game.currentQuestion?.explanation,
      eliminated: [],
      survivors: activePlayers.map(p => p.id),
      answeredCount: game.roundAnswers.size,
      totalActive: activePlayers.length,
    }
    game.roundResults = result
    return result
  }

  // Determine rank offset: eliminated players share a rank based on total remaining
  const eliminated: EliminationEvent[] = []
  const survivors: string[] = correctPlayers.map(p => p.id)

  // Rank = position from the bottom (e.g., 10 players total, 3 eliminated → rank 8, 9, 10)
  const totalActive = activePlayers.length
  const rankStart = survivors.length + 1

  wrongPlayers.forEach((player, idx) => {
    const rank = rankStart + idx
    player.status = 'eliminated'
    player.rank = rank

    const event: EliminationEvent = {
      playerId: player.id,
      nickname: player.nickname,
      round: game.currentRound,
      rank,
      timestamp: Date.now(),
    }
    eliminated.push(event)

    // Prepend to elimination feed, cap at 20 entries
    game.eliminationFeed.unshift(event)
    if (game.eliminationFeed.length > 20) game.eliminationFeed.pop()
  })

  const result: RoundResult = {
    correctAnswer,
    explanation: game.currentQuestion?.explanation,
    eliminated,
    survivors,
    answeredCount: game.roundAnswers.size,
    totalActive,
  }

  game.roundResults = result
  return result
}

// ---------------------------------------------------------------------------
// Game-over detection
// ---------------------------------------------------------------------------
export function checkGameOver(
  game: InternalGameState
): { isOver: boolean; winner: Player | null } {
  const activePlayers = Object.values(game.players).filter(p => p.status === 'active')

  if (activePlayers.length === 1) {
    const winner = activePlayers[0]
    winner.rank = 1
    game.winner = winner
    game.status = 'ended'
    return { isOver: true, winner }
  }

  if (activePlayers.length === 0) {
    game.status = 'ended'
    return { isOver: true, winner: null }
  }

  // Out of questions → highest score wins
  if (game.currentRound >= game.questionQueue.length) {
    const winner = activePlayers.reduce(
      (best, p) => (p.score > best.score ? p : best),
      activePlayers[0]
    )
    winner.rank = 1
    game.winner = winner
    game.status = 'ended'
    return { isOver: true, winner }
  }

  return { isOver: false, winner: null }
}

// ---------------------------------------------------------------------------
// Public state projection (strips server-only fields)
// ---------------------------------------------------------------------------
export function getPublicGameState(game: InternalGameState): GameState {
  return {
    roomCode: game.roomCode,
    status: game.status,
    players: game.players,
    currentRound: game.currentRound,
    totalRounds: game.totalRounds,
    currentQuestion: game.currentQuestion,
    timeRemaining: game.timeRemaining,
    timeLimit: game.timeLimit,
    roundResults: game.roundResults,
    winner: game.winner,
    eliminationFeed: game.eliminationFeed,
  }
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
export function deleteGame(roomCode: string): void {
  const game = games.get(roomCode)
  if (!game) return

  if (game.timerRef) {
    clearInterval(game.timerRef)
  }

  for (const player of Object.values(game.players)) {
    playerToGame.delete(player.id)
    if (player.socketId) {
      socketToPlayer.delete(player.socketId)
    }
  }

  games.delete(roomCode)
}
