'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Skull, Loader2, Zap, Users } from 'lucide-react'
import type { GameState, RoundResult } from '@/types/game'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { Timer } from '@/components/shared/Timer'
import { AnswerOptions } from './AnswerOptions'
import { SpectatorView } from './SpectatorView'
import { WinnerScreen } from '@/components/shared/WinnerScreen'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface StudentGameProps {
  gameState: GameState
  playerId: string
  nickname: string
  onSubmitAnswer: (answer: string) => void
}

export function StudentGame({
  gameState,
  playerId,
  nickname,
  onSubmitAnswer,
}: StudentGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [showWinner, setShowWinner] = useState(false)
  const lastRoundRef = useRef<number>(0)

  const me = gameState.players[playerId]
  const isEliminated = me?.status === 'eliminated'
  const isSpectating = me?.status === 'spectating'

  // Reset per round
  useEffect(() => {
    if (
      gameState.status === 'question' &&
      gameState.currentRound !== lastRoundRef.current
    ) {
      setSelectedAnswer(null)
      setHasSubmitted(false)
      setAnswerResult(null)
      lastRoundRef.current = gameState.currentRound
    }
  }, [gameState.status, gameState.currentRound])

  // Show winner screen
  useEffect(() => {
    if (gameState.status === 'ended') {
      const t = setTimeout(() => setShowWinner(true), 1000)
      return () => clearTimeout(t)
    }
  }, [gameState.status])

  const handleSelect = useCallback(
    (option: string) => {
      if (hasSubmitted || gameState.status !== 'question') return
      setSelectedAnswer(option)
      setHasSubmitted(true)
      onSubmitAnswer(option)
    },
    [hasSubmitted, gameState.status, onSubmitAnswer]
  )

  // Determine answer result when round ends
  const roundResult: RoundResult | null = gameState.roundResults
  useEffect(() => {
    if (gameState.status === 'results' && roundResult && selectedAnswer) {
      setAnswerResult(
        selectedAnswer === roundResult.correctAnswer ? 'correct' : 'wrong'
      )
    }
  }, [gameState.status, roundResult, selectedAnswer])

  // Winner screen
  if (showWinner && gameState.winner?.id === playerId) {
    return <WinnerScreen winner={gameState.winner} />
  }

  // Spectator/eliminated view
  if ((isEliminated || isSpectating) && gameState.status !== 'ended') {
    const eliminationEvent = gameState.eliminationFeed.find(
      (e) => e.playerId === playerId
    )
    return (
      <SpectatorView
        gameState={gameState}
        eliminatedRound={eliminationEvent?.round ?? 0}
        myRank={me?.rank ?? null}
        nickname={nickname}
      />
    )
  }

  // Game ended but I'm not the winner
  if (gameState.status === 'ended' || showWinner) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: '#0a0a0f' }}
      >
        <div className="text-center max-w-md">
          {gameState.winner ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-3xl font-black text-white mb-2">
                {gameState.winner.nickname} wins!
              </h1>
              {me?.rank && (
                <p className="text-gray-400 mb-6">
                  You finished in position #{me.rank}
                </p>
              )}
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mb-8"
                style={{
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                }}
              >
                <Zap size={16} className="text-purple-400" />
                <span className="text-purple-300 font-bold">
                  Your score: {me?.score.toLocaleString() ?? 0}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💀</div>
              <h1 className="text-3xl font-black text-white mb-2">
                Game Over
              </h1>
              <p className="text-gray-400">Nobody survived calculus today.</p>
            </>
          )}
          <a
            href="/play"
            className="inline-block px-6 py-3 rounded-xl text-white font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            Play Again
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0f' }}
    >
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #1e1e2e', background: '#13131a' }}
      >
        <div className="flex items-center gap-3">
          <Badge variant="default">{nickname}</Badge>
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Zap size={12} className="text-purple-400" />
            {me?.score.toLocaleString() ?? 0} pts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Users size={12} />
            {Object.values(gameState.players).filter((p) => p.status === 'active').length} left
          </span>
          {gameState.currentRound > 0 && (
            <Badge variant="secondary">
              Round {gameState.currentRound}/{gameState.totalRounds}
            </Badge>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Waiting state */}
          {gameState.status === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                ⏳
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                You&apos;re in!
              </h2>
              <p className="text-gray-400 mb-4">
                Waiting for the host to start the game...
              </p>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <span className="text-purple-400 font-mono font-bold text-lg">
                  {gameState.roomCode}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                {Object.values(gameState.players).length} players joined
              </p>
            </motion.div>
          )}

          {/* Starting state */}
          {gameState.status === 'starting' && (
            <motion.div
              key="starting"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🚀
              </motion.div>
              <h2 className="text-3xl font-black text-white">Get Ready!</h2>
              <p className="text-gray-400 mt-2">Round 1 is starting...</p>
            </motion.div>
          )}

          {/* Question state */}
          {gameState.status === 'question' && gameState.currentQuestion && (
            <motion.div
              key={`q-${gameState.currentRound}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-5"
            >
              {/* Timer row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Round {gameState.currentRound} of {gameState.totalRounds}
                  </p>
                  <p className="text-xs text-gray-500">
                    {gameState.currentQuestion.topic} · {'★'.repeat(gameState.currentQuestion.difficulty)}
                  </p>
                </div>
                <Timer
                  timeRemaining={gameState.timeRemaining}
                  timeLimit={gameState.timeLimit}
                  size={80}
                />
              </div>

              {/* Progress */}
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

              {/* Question */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <MathRenderer
                  latex={gameState.currentQuestion.latex}
                  displayMode
                  className="text-xl"
                />
              </div>

              {/* Submitted state */}
              {hasSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm font-medium justify-center"
                  style={{ color: '#06b6d4' }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  Answer submitted — waiting for round to end...
                </motion.div>
              )}

              {/* Answer options */}
              <AnswerOptions
                options={gameState.currentQuestion.options}
                selected={selectedAnswer}
                correctAnswer={null}
                disabled={hasSubmitted}
                onSelect={handleSelect}
              />
            </motion.div>
          )}

          {/* Results state */}
          {gameState.status === 'results' &&
            gameState.currentQuestion &&
            gameState.roundResults && (
              <motion.div
                key={`results-${gameState.currentRound}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-5"
              >
                {/* Result banner */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background:
                      answerResult === 'correct'
                        ? 'rgba(16,185,129,0.15)'
                        : answerResult === 'wrong'
                        ? 'rgba(239,68,68,0.15)'
                        : 'rgba(107,114,128,0.1)',
                    border:
                      answerResult === 'correct'
                        ? '1px solid rgba(16,185,129,0.4)'
                        : answerResult === 'wrong'
                        ? '1px solid rgba(239,68,68,0.4)'
                        : '1px solid #1e1e2e',
                  }}
                >
                  {answerResult === 'correct' ? (
                    <>
                      <div className="text-4xl mb-2">🎉</div>
                      <h2 className="text-2xl font-black text-emerald-400">
                        Correct!
                      </h2>
                      <p className="text-gray-300 text-sm mt-1">You survived this round</p>
                    </>
                  ) : answerResult === 'wrong' ? (
                    <>
                      <div className="text-4xl mb-2">💀</div>
                      <h2 className="text-2xl font-black text-red-400">
                        Eliminated!
                      </h2>
                      <p className="text-gray-300 text-sm mt-1">
                        Wrong answer — you&apos;re out
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">⏰</div>
                      <h2 className="text-2xl font-black text-yellow-400">
                        Time&apos;s Up!
                      </h2>
                      <p className="text-gray-300 text-sm mt-1">
                        No answer submitted
                      </p>
                    </>
                  )}
                </motion.div>

                {/* Correct answer reveal */}
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: 'rgba(16,185,129,0.05)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">
                    Correct Answer
                  </p>
                  <MathRenderer
                    latex={gameState.roundResults.correctAnswer}
                    displayMode
                  />
                </div>

                {/* Explanation */}
                {gameState.roundResults.explanation && (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(6,182,212,0.05)',
                      border: '1px solid rgba(6,182,212,0.15)',
                    }}
                  >
                    <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">
                      Explanation
                    </p>
                    <MathRenderer latex={gameState.roundResults.explanation} />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.15)',
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      className="text-emerald-400 mx-auto mb-1"
                    />
                    <p className="text-xl font-black text-emerald-400">
                      {gameState.roundResults.survivors.length}
                    </p>
                    <p className="text-xs text-gray-400">survived</p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                    }}
                  >
                    <Skull size={18} className="text-red-400 mx-auto mb-1" />
                    <p className="text-xl font-black text-red-400">
                      {gameState.roundResults.eliminated.length}
                    </p>
                    <p className="text-xs text-gray-400">eliminated</p>
                  </div>
                </div>

                <p className="text-center text-gray-500 text-sm">
                  Next round starting soon...
                </p>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}
