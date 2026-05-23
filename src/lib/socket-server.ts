import { Server as SocketIOServer } from 'socket.io'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/game'
import * as engine from './game-engine'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Question selection helpers
// ---------------------------------------------------------------------------

/**
 * Selects `count` questions from the full pool with difficulty weighting.
 * Difficulty distribution: 1→20%, 2→30%, 3→30%, 4→15%, 5→5%
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function selectQuestions(questions: any[], count: number): any[] {
  const byDifficulty = new Map<number, typeof questions>()

  for (const q of questions) {
    if (!byDifficulty.has(q.difficulty)) byDifficulty.set(q.difficulty, [])
    byDifficulty.get(q.difficulty)!.push(q)
  }

  const difficulties = [1, 2, 3, 4, 5]
  const weights = [0.2, 0.3, 0.3, 0.15, 0.05]

  const selected: typeof questions = []

  for (let i = 0; i < difficulties.length; i++) {
    const pool = [...(byDifficulty.get(difficulties[i]) ?? [])]
    const shuffled = pool.sort(() => Math.random() - 0.5)
    const take = Math.round(count * weights[i])
    selected.push(...shuffled.slice(0, take))
  }

  // Fill remaining quota with any unused questions
  const usedIds = new Set(selected.map((q: { id: string }) => q.id))
  const remaining = questions
    .filter(q => !usedIds.has(q.id))
    .sort(() => Math.random() - 0.5)

  while (selected.length < count && remaining.length > 0) {
    selected.push(remaining.pop())
  }

  // Sort by difficulty ascending (easy → hard) and cap
  return selected
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, count)
}

// ---------------------------------------------------------------------------
// Main Socket.IO initialiser
// ---------------------------------------------------------------------------
export function initSocketServer(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>
): void {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // -----------------------------------------------------------------------
    // HOST: Create a new game room
    // -----------------------------------------------------------------------
    socket.on('host-game', (callback) => {
      try {
        const game = engine.createGame(socket.id, io)
        socket.join(`game:${game.roomCode}`)
        socket.join(`host:${game.roomCode}`)
        callback({ success: true, roomCode: game.roomCode })
        console.log(`Game created: ${game.roomCode}`)
      } catch (err) {
        console.error('Error creating game:', err)
        callback({ success: false, error: 'Failed to create game' })
      }
    })

    // -----------------------------------------------------------------------
    // HOST: Reconnect to an existing game (e.g. after page refresh)
    // -----------------------------------------------------------------------
    socket.on('host-reconnect', (roomCode, callback) => {
      const game = engine.getGame(roomCode)
      if (!game) {
        callback({ success: false, error: 'Game not found' })
        return
      }

      game.hostSocketId = socket.id
      socket.join(`game:${roomCode}`)
      socket.join(`host:${roomCode}`)
      socket.emit('game-state', engine.getPublicGameState(game))
      callback({ success: true })
      console.log(`Host reconnected to game: ${roomCode}`)
    })

    // -----------------------------------------------------------------------
    // PLAYER: Join a waiting game
    // -----------------------------------------------------------------------
    socket.on('join-game', ({ roomCode, nickname }, callback) => {
      const game = engine.getGame(roomCode.toUpperCase().trim())
      if (!game) {
        callback({ success: false, error: 'Game not found. Check your room code.' })
        return
      }

      if (game.status !== 'waiting') {
        callback({ success: false, error: 'This game has already started.' })
        return
      }

      // Reject duplicate nicknames (case-insensitive)
      const nicknameTaken = Object.values(game.players).some(
        p => p.nickname.toLowerCase() === nickname.toLowerCase()
      )
      if (nicknameTaken) {
        callback({ success: false, error: 'That nickname is already taken. Pick another.' })
        return
      }

      const trimmedNick = nickname.trim().slice(0, 24)
      if (!trimmedNick) {
        callback({ success: false, error: 'Nickname cannot be empty.' })
        return
      }

      const player = engine.addPlayer(game, trimmedNick, socket.id)
      socket.join(`game:${game.roomCode}`)
      socket.data.playerId = player.id
      socket.data.roomCode = game.roomCode

      callback({ success: true, playerId: player.id })

      // Broadcast to everyone in the room (including host dashboard)
      io.to(`game:${game.roomCode}`).emit('player-joined', player)
      // Send full game state to the new player
      socket.emit('game-state', engine.getPublicGameState(game))

      console.log(`Player "${trimmedNick}" joined game ${game.roomCode}`)
    })

    // -----------------------------------------------------------------------
    // PLAYER: Reconnect after a dropped connection
    // -----------------------------------------------------------------------
    socket.on('reconnect-player', ({ roomCode, playerId }, callback) => {
      const game = engine.getGame(roomCode)
      if (!game) {
        callback({ success: false, error: 'Game not found' })
        return
      }

      const player = engine.reconnectPlayer(game, playerId, socket.id)
      if (!player) {
        callback({ success: false, error: 'Player session not found' })
        return
      }

      socket.join(`game:${roomCode}`)
      socket.data.playerId = playerId
      socket.data.roomCode = roomCode

      socket.emit('game-state', engine.getPublicGameState(game))
      callback({ success: true })

      io.to(`game:${roomCode}`).emit('player-joined', player)
      console.log(`Player "${player.nickname}" reconnected to game ${roomCode}`)
    })

    // -----------------------------------------------------------------------
    // HOST: Start the game – loads questions from DB and kicks off round 1
    // -----------------------------------------------------------------------
    socket.on('host-start-game', async (roomCode) => {
      const game = engine.getGame(roomCode)
      if (!game) return
      if (game.hostSocketId !== socket.id) return
      if (game.status !== 'waiting') return

      const playerCount = Object.values(game.players).length
      if (playerCount < 1) {
        socket.emit('error', { message: 'Need at least one player to start.' })
        return
      }

      try {
        const allQuestions = await prisma.question.findMany({
          where: { isActive: true },
          orderBy: { difficulty: 'asc' },
        })

        if (allQuestions.length === 0) {
          socket.emit('error', {
            message: 'No questions found. Run `npm run db:seed` first.',
          })
          return
        }

        // Scale question count with player count: 10–20 questions
        const questionCount = Math.min(
          Math.max(10, Math.ceil(playerCount * 1.5)),
          Math.min(allQuestions.length, 20)
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const selected = selectQuestions(allQuestions as any[], questionCount)
        engine.setQuestions(game, selected)

        game.status = 'starting'
        io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))

        console.log(
          `Game ${roomCode} starting with ${selected.length} questions for ${playerCount} player(s)`
        )

        // Brief countdown before round 1
        setTimeout(() => startRound(game, roomCode), 3000)
      } catch (err) {
        console.error('Error starting game:', err)
        socket.emit('error', { message: 'Failed to load questions from the database.' })
      }
    })

    // -----------------------------------------------------------------------
    // HOST: Advance to next round (called from results screen)
    // -----------------------------------------------------------------------
    socket.on('host-next-round', (roomCode) => {
      const game = engine.getGame(roomCode)
      if (!game) return
      if (game.hostSocketId !== socket.id) return
      if (game.status !== 'results') return

      const { isOver, winner } = engine.checkGameOver(game)
      if (isOver) {
        io.to(`game:${roomCode}`).emit('game-over', winner)
        io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))
      } else {
        startRound(game, roomCode)
      }
    })

    // -----------------------------------------------------------------------
    // HOST: Pause the game (freeze timer for a break)
    // -----------------------------------------------------------------------
    socket.on('host-pause-game', (roomCode) => {
      const game = engine.getGame(roomCode)
      if (!game) return
      if (game.hostSocketId !== socket.id) return

      // Stop the timer if running
      if (game.timerRef) {
        clearInterval(game.timerRef as NodeJS.Timeout)
        game.timerRef = null
        console.log(`Game ${roomCode} paused`)
      }
    })

    // -----------------------------------------------------------------------
    // HOST: Force-end the game early
    // -----------------------------------------------------------------------
    socket.on('host-end-game', (roomCode) => {
      const game = engine.getGame(roomCode)
      if (!game) return
      if (game.hostSocketId !== socket.id) return

      // Stop any running timer
      if (game.timerRef) {
        clearInterval(game.timerRef as NodeJS.Timeout)
        game.timerRef = null
      }

      game.status = 'ended'

      const activePlayers = Object.values(game.players).filter(
        p => p.status === 'active'
      )
      let winner = null
      if (activePlayers.length > 0) {
        winner = activePlayers.reduce(
          (best, p) => (p.score > best.score ? p : best),
          activePlayers[0]
        )
        winner.rank = 1
        game.winner = winner
      }

      io.to(`game:${roomCode}`).emit('game-over', winner)
      io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))
      console.log(`Game ${roomCode} ended by host`)
    })

    // -----------------------------------------------------------------------
    // PLAYER: Submit an answer for the current round
    // -----------------------------------------------------------------------
    socket.on('submit-answer', ({ answer }) => {
      const playerId = socket.data.playerId as string | undefined
      const roomCode = socket.data.roomCode as string | undefined

      if (!playerId || !roomCode) return

      const game = engine.getGame(roomCode)
      if (!game || game.status !== 'question') return

      const allAnswered = engine.submitAnswer(game, playerId, answer)

      // Immediately confirm correctness to the submitting player
      const isCorrect = answer === game.currentQuestion?.answer
      socket.emit('answer-confirmed', { correct: isCorrect })

      // Push updated state to host dashboard so answer count updates live
      io.to(`host:${roomCode}`).emit('game-state', engine.getPublicGameState(game))

      // Early round-end when everyone has answered
      if (allAnswered) {
        // Clear the countdown timer ourselves before finishRound does
        const liveGame = engine.getGame(roomCode)
        if (liveGame?.timerRef) {
          clearInterval(liveGame.timerRef as NodeJS.Timeout)
          liveGame.timerRef = null
        }
        // Small delay so the last player sees their confirmation before results
        setTimeout(() => finishRound(game, roomCode), 1000)
      }
    })

    // -----------------------------------------------------------------------
    // Handle disconnect
    // -----------------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      const result = engine.disconnectPlayer(socket.id)
      if (result) {
        const { game, player } = result
        console.log(
          `Player "${player.nickname}" disconnected from game ${game.roomCode} (${reason})`
        )
        io.to(`game:${game.roomCode}`).emit('player-left', player.id)
        io.to(`host:${game.roomCode}`).emit('game-state', engine.getPublicGameState(game))
      }
    })

    // -----------------------------------------------------------------------
    // Internal helpers (closures – access `io` via outer scope)
    // -----------------------------------------------------------------------

    function startRound(game: engine.InternalGameState, roomCode: string): void {
      const question = engine.startRound(
        game,
        (timeRemaining) => {
          io.to(`game:${roomCode}`).emit('timer-tick', timeRemaining)
        },
        () => finishRound(game, roomCode)
      )

      if (!question) {
        // Ran out of questions – determine winner by score
        const { winner } = engine.checkGameOver(game)
        io.to(`game:${roomCode}`).emit('game-over', winner)
        io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))
        return
      }

      io.to(`game:${roomCode}`).emit('round-start', {
        question,
        roundNumber: game.currentRound,
        timeLimit: game.timeLimit,
        totalQuestions: game.totalRounds,
      })

      io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))
      console.log(`Round ${game.currentRound} started in game ${roomCode}`)
    }

    function finishRound(game: engine.InternalGameState, roomCode: string): void {
      // Guard against double invocation (timer callback + early-end callback race)
      if (game.status !== 'question') return

      const result = engine.endRound(game)

      // Stagger elimination events for dramatic effect
      result.eliminated.forEach((event, i) => {
        setTimeout(() => {
          io.to(`game:${roomCode}`).emit('elimination', event)
        }, i * 400)
      })

      io.to(`game:${roomCode}`).emit('round-end', result)
      io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))

      console.log(
        `Round ${game.currentRound} ended in game ${roomCode} – ` +
        `${result.survivors.length} survivor(s), ${result.eliminated.length} eliminated`
      )

      // Check if the game is already over
      const { isOver, winner } = engine.checkGameOver(game)
      if (isOver) {
        setTimeout(() => {
          io.to(`game:${roomCode}`).emit('game-over', winner)
          io.to(`game:${roomCode}`).emit('game-state', engine.getPublicGameState(game))
          console.log(
            `Game ${roomCode} over – winner: ${winner?.nickname ?? 'none'}`
          )
        }, 3000)
      }
    }
  })
}
