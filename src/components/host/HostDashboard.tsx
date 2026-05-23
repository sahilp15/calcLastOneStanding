'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Play,
  SkipForward,
  Square,
  Crown,
  Skull,
  Eye,
  CheckCircle2,
  Clock,
  Zap,
  ChevronRight,
} from 'lucide-react'
import type { GameState, Player, EliminationEvent } from '@/types/game'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { Timer } from '@/components/shared/Timer'
import { WinnerScreen } from '@/components/shared/WinnerScreen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface HostDashboardProps {
  gameState: GameState
  onStartGame: () => void
  onNextRound: () => void
  onPauseGame: () => void
  onEndGame: () => void
}

function PlayerStatusIcon({ status }: { status: Player['status'] }) {
  if (status === 'active')
    return <CheckCircle2 size={14} className="text-emerald-400" />
  if (status === 'eliminated') return <Skull size={14} className="text-red-400" />
  return <Eye size={14} className="text-gray-400" />
}

function StatusBadge({ status }: { status: GameState['status'] }) {
  const map: Record<GameState['status'], { label: string; variant: 'default' | 'success' | 'accent' | 'warning' | 'secondary' | 'destructive' | 'outline' }> = {
    waiting: { label: 'Waiting', variant: 'secondary' },
    starting: { label: 'Starting...', variant: 'accent' },
    question: { label: 'Live', variant: 'success' },
    results: { label: 'Results', variant: 'warning' },
    ended: { label: 'Ended', variant: 'secondary' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function HostDashboard({
  gameState,
  onStartGame,
  onNextRound,
  onPauseGame,
  onEndGame,
}: HostDashboardProps) {
  const [showWinner, setShowWinner] = useState(false)
  const eliminationFeedRef = useRef<HTMLDivElement>(null)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const players = Object.values(gameState.players)
  const activePlayers = players.filter((p) => p.status === 'active')
  const eliminatedPlayers = players.filter((p) => p.status === 'eliminated')
  const answeredCount = activePlayers.filter((p) => p.answeredThisRound).length

  // Show winner screen when game ends
  useEffect(() => {
    if (gameState.status === 'ended') {
      const t = setTimeout(() => setShowWinner(true), 1500)
      return () => clearTimeout(t)
    }
  }, [gameState.status])

  // Auto-advance to next round after 8 seconds of results
  useEffect(() => {
    if (gameState.status === 'results') {
      autoAdvanceRef.current = setTimeout(() => {
        onNextRound()
      }, 8000)
    }
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
    }
  }, [gameState.status, onNextRound])

  // Scroll elimination feed to bottom
  useEffect(() => {
    if (eliminationFeedRef.current) {
      eliminationFeedRef.current.scrollTop = eliminationFeedRef.current.scrollHeight
    }
  }, [gameState.eliminationFeed.length])

  const leaderboard = [...players]
    .filter((p) => p.score > 0 || p.status === 'active')
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  if (showWinner) {
    return (
      <WinnerScreen
        winner={gameState.winner}
        isHost
        onPlayAgain={() => window.location.assign('/host')}
      />
    )
  }

  return (
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{ background: '#0a0a0f' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">Last One Standing</h1>
              <StatusBadge status={gameState.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {activePlayers.length} active / {players.length} total
              </span>
              {gameState.currentRound > 0 && (
                <span className="flex items-center gap-1">
                  <Zap size={14} />
                  Round {gameState.currentRound} of {gameState.totalRounds}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Room Code */}
        <div
          className="text-center px-6 py-3 rounded-2xl"
          style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Room Code</p>
          <p
            className="text-4xl font-black tracking-[0.2em]"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {gameState.roomCode}
          </p>
          <p className="text-xs text-gray-500 mt-1">join at this site /play</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Main content */}
        <div className="xl:col-span-2 space-y-4">
          {/* Question Card */}
          <AnimatePresence mode="wait">
            {gameState.status === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl p-8 text-center"
                style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
              >
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Waiting for Students
                </h2>
                <p className="text-gray-400 mb-6">
                  {players.length === 0
                    ? 'Share the room code. Students can join at /play'
                    : `${players.length} student${players.length === 1 ? '' : 's'} joined. Start when ready!`}
                </p>
                {players.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {players.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                      >
                        {p.nickname}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  onClick={onStartGame}
                  disabled={players.length === 0}
                  size="xl"
                  className="gap-2"
                >
                  <Play size={20} />
                  Start Game
                </Button>
              </motion.div>
            )}

            {gameState.status === 'starting' && (
              <motion.div
                key="starting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl p-12 text-center"
                style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  🚀
                </motion.div>
                <h2 className="text-3xl font-black text-white">Game Starting!</h2>
                <p className="text-gray-400 mt-2">Get ready for round 1...</p>
              </motion.div>
            )}

            {(gameState.status === 'question' || gameState.status === 'results') &&
              gameState.currentQuestion && (
                <motion.div
                  key={`question-${gameState.currentRound}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
                >
                  {/* Question header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: '1px solid #1e1e2e' }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="accent">
                        Round {gameState.currentRound}
                      </Badge>
                      <Badge variant="secondary">
                        {gameState.currentQuestion.topic}
                      </Badge>
                      <Badge
                        variant={
                          gameState.currentQuestion.difficulty <= 2
                            ? 'success'
                            : gameState.currentQuestion.difficulty <= 3
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {'★'.repeat(gameState.currentQuestion.difficulty)}
                      </Badge>
                    </div>
                    {gameState.status === 'question' && (
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-400">
                          <span className="text-white font-bold">{answeredCount}</span>
                          /{activePlayers.length} answered
                        </div>
                        <Timer
                          timeRemaining={gameState.timeRemaining}
                          timeLimit={gameState.timeLimit}
                          size={72}
                        />
                      </div>
                    )}
                    {gameState.status === 'results' && (
                      <Badge variant="success">Round Complete</Badge>
                    )}
                  </div>

                  {/* Question body */}
                  <div className="p-8">
                    <div
                      className="rounded-xl p-6 mb-6 text-center"
                      style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}
                    >
                      <MathRenderer
                        latex={gameState.currentQuestion.latex}
                        displayMode
                        className="text-xl"
                      />
                    </div>

                    {/* Answer options */}
                    <div className="grid grid-cols-2 gap-3">
                      {gameState.currentQuestion.options.map((option, i) => {
                        const isCorrect =
                          gameState.status === 'results' &&
                          option === gameState.roundResults?.correctAnswer
                        return (
                          <div
                            key={i}
                            className="p-4 rounded-xl text-center transition-all"
                            style={{
                              background: isCorrect
                                ? 'rgba(16,185,129,0.15)'
                                : 'rgba(255,255,255,0.03)',
                              border: isCorrect
                                ? '1px solid rgba(16,185,129,0.5)'
                                : '1px solid #1e1e2e',
                            }}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            <MathRenderer latex={option} className="inline" />
                            {isCorrect && (
                              <CheckCircle2
                                size={16}
                                className="inline ml-2 text-emerald-400"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {gameState.status === 'results' &&
                      gameState.roundResults?.explanation && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 rounded-xl"
                          style={{
                            background: 'rgba(6,182,212,0.05)',
                            border: '1px solid rgba(6,182,212,0.2)',
                          }}
                        >
                          <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">
                            Explanation
                          </p>
                          <MathRenderer latex={gameState.roundResults.explanation} />
                        </motion.div>
                      )}
                  </div>

                  {/* Progress bar for timer */}
                  {gameState.status === 'question' && (
                    <div className="px-6 pb-4">
                      <Progress
                        value={(gameState.timeRemaining / gameState.timeLimit) * 100}
                        indicatorClassName={
                          gameState.timeRemaining <= 5
                            ? 'bg-red-500'
                            : gameState.timeRemaining <= 10
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }
                      />
                    </div>
                  )}

                  {/* Results summary */}
                  {gameState.status === 'results' && gameState.roundResults && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-6 pb-6"
                    >
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div
                          className="p-3 rounded-xl"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                          <p className="text-2xl font-black text-emerald-400">
                            {gameState.roundResults.survivors.length}
                          </p>
                          <p className="text-xs text-gray-400">Survived</p>
                        </div>
                        <div
                          className="p-3 rounded-xl"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <p className="text-2xl font-black text-red-400">
                            {gameState.roundResults.eliminated.length}
                          </p>
                          <p className="text-xs text-gray-400">Eliminated</p>
                        </div>
                        <div
                          className="p-3 rounded-xl"
                          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
                        >
                          <p className="text-2xl font-black text-purple-400">
                            {gameState.roundResults.answeredCount}
                          </p>
                          <p className="text-xs text-gray-400">Answered</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
          </AnimatePresence>

          {/* Control Buttons */}
          <div className="flex gap-3 flex-wrap">
            {gameState.status === 'results' && (
              <>
                <Button onClick={() => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); onNextRound() }} size="lg" className="gap-2">
                  <SkipForward size={18} />
                  Next Round
                </Button>
                <Button onClick={onPauseGame} variant="secondary" size="lg" className="gap-2">
                  <Clock size={18} />
                  Pause
                </Button>
              </>
            )}
            {(gameState.status === 'question' ||
              gameState.status === 'results' ||
              gameState.status === 'starting') && (
              <Button onClick={onEndGame} variant="destructive" size="lg" className="gap-2">
                <Square size={18} />
                End Game
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4">
          {/* Player List */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid #1e1e2e' }}
            >
              <h3 className="font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                Players
              </h3>
              <span className="text-sm text-gray-400">
                {activePlayers.length} active
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto p-3 space-y-1.5">
              {players.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No players yet
                </p>
              ) : (
                players
                  .sort((a, b) => {
                    if (a.status === 'active' && b.status !== 'active') return -1
                    if (a.status !== 'active' && b.status === 'active') return 1
                    return b.score - a.score
                  })
                  .map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{
                        background:
                          player.status === 'eliminated'
                            ? 'rgba(239,68,68,0.05)'
                            : 'rgba(255,255,255,0.03)',
                        opacity: player.status === 'eliminated' ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <PlayerStatusIcon status={player.status} />
                        <span
                          className={`text-sm font-medium ${
                            player.status === 'eliminated'
                              ? 'text-gray-500 line-through'
                              : 'text-white'
                          }`}
                        >
                          {player.nickname}
                        </span>
                        {player.answeredThisRound &&
                          gameState.status === 'question' && (
                            <CheckCircle2 size={12} className="text-emerald-400" />
                          )}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {player.score > 0 ? player.score.toLocaleString() : '—'}
                      </span>
                    </motion.div>
                  ))
              )}
            </div>
          </div>

          {/* Elimination Feed */}
          {gameState.eliminationFeed.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid #1e1e2e' }}
              >
                <Skull size={16} className="text-red-400" />
                <h3 className="font-bold text-white">Eliminations</h3>
              </div>
              <div
                ref={eliminationFeedRef}
                className="max-h-44 overflow-y-auto p-3 space-y-2"
              >
                <AnimatePresence>
                  {[...gameState.eliminationFeed]
                    .reverse()
                    .slice(0, 20)
                    .map((event) => (
                      <motion.div
                        key={`${event.playerId}-${event.round}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-red-400">💀</span>
                        <span className="text-gray-300 font-medium">{event.nickname}</span>
                        <span className="text-gray-500 text-xs">
                          round {event.round} · #{event.rank}
                        </span>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid #1e1e2e' }}
              >
                <Crown size={16} className="text-yellow-400" />
                <h3 className="font-bold text-white">Leaderboard</h3>
              </div>
              <div className="p-3 space-y-2">
                {leaderboard.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{
                      background:
                        idx === 0
                          ? 'rgba(234,179,8,0.1)'
                          : 'rgba(255,255,255,0.02)',
                      border:
                        idx === 0
                          ? '1px solid rgba(234,179,8,0.2)'
                          : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 text-center text-sm font-bold"
                        style={{
                          color:
                            idx === 0
                              ? '#fbbf24'
                              : idx === 1
                              ? '#94a3b8'
                              : idx === 2
                              ? '#cd7c54'
                              : '#6b7280',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          player.status === 'eliminated'
                            ? 'text-gray-500'
                            : 'text-white'
                        }`}
                      >
                        {player.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-400">
                        {player.score.toLocaleString()}
                      </span>
                      <ChevronRight size={12} className="text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
