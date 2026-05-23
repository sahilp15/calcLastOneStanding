export type GameStatus = 'waiting' | 'starting' | 'question' | 'results' | 'ended'
export type PlayerStatus = 'active' | 'eliminated' | 'spectating'

export interface Question {
  id: string
  latex: string
  options: string[]
  answer: string
  explanation?: string
  difficulty: number
  topic: string
}

export interface Player {
  id: string
  nickname: string
  socketId: string | null
  status: PlayerStatus
  score: number
  rank: number | null
  answeredThisRound: boolean
  hasAnsweredCorrectly?: boolean
}

export interface EliminationEvent {
  playerId: string
  nickname: string
  round: number
  rank: number
  timestamp: number
}

export interface RoundResult {
  correctAnswer: string
  explanation?: string
  eliminated: EliminationEvent[]
  survivors: string[] // player IDs
  answeredCount: number
  totalActive: number
}

export interface GameState {
  roomCode: string
  status: GameStatus
  players: Record<string, Player>
  currentRound: number
  totalRounds: number
  currentQuestion: Question | null
  timeRemaining: number
  timeLimit: number
  roundResults: RoundResult | null
  winner: Player | null
  eliminationFeed: EliminationEvent[]
}

// Socket event payloads
export interface JoinGamePayload {
  roomCode: string
  nickname: string
}

export interface SubmitAnswerPayload {
  answer: string
}

export interface HostActionPayload {
  roomCode: string
}

export interface ServerToClientEvents {
  'game-state': (state: GameState) => void
  'player-joined': (player: Player) => void
  'player-left': (playerId: string) => void
  'round-start': (data: {
    question: Question
    roundNumber: number
    timeLimit: number
    totalQuestions: number
  }) => void
  'timer-tick': (timeRemaining: number) => void
  'answer-confirmed': (data: { correct: boolean }) => void
  'round-end': (result: RoundResult) => void
  'game-over': (winner: Player | null) => void
  'elimination': (event: EliminationEvent) => void
  'error': (data: { message: string }) => void
  'host-assigned': (roomCode: string) => void
}

export interface ClientToServerEvents {
  'join-game': (
    payload: JoinGamePayload,
    callback: (response: { success: boolean; error?: string; playerId?: string }) => void
  ) => void
  'host-game': (
    callback: (response: { success: boolean; roomCode?: string; error?: string }) => void
  ) => void
  'host-start-game': (roomCode: string) => void
  'host-next-round': (roomCode: string) => void
  'host-pause-game': (roomCode: string) => void
  'host-end-game': (roomCode: string) => void
  'host-reconnect': (
    roomCode: string,
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  'submit-answer': (payload: SubmitAnswerPayload) => void
  'reconnect-player': (
    payload: { roomCode: string; playerId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
}
