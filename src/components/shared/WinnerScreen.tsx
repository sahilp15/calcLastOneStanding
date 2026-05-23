'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Player } from '@/types/game'

interface WinnerScreenProps {
  winner: Player | null
  isHost?: boolean
  onPlayAgain?: () => void
}

export function WinnerScreen({ winner, isHost, onPlayAgain }: WinnerScreenProps) {
  useEffect(() => {
    const duration = 5000
    const end = Date.now() + duration

    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    // Central burst
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors,
    })
  }, [])

  if (!winner) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center px-8"
        >
          <div className="text-8xl mb-6">💀</div>
          <h1 className="text-5xl font-black text-white mb-4">EVERYONE ELIMINATED!</h1>
          <p className="text-xl text-gray-400">No winner this round. Calculus wins again.</p>
          {isHost && onPlayAgain && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <button
                onClick={onPlayAgain}
                className="px-8 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
              >
                Play Again
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0a3a 0%, #0a0a0f 70%)',
      }}
    >
      <div className="text-center px-8">
        {/* Animated trophy */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="text-9xl mb-6 filter drop-shadow-lg"
        >
          🏆
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-cyan-400 text-xl font-bold tracking-[0.3em] uppercase mb-2">
            Last One Standing
          </p>
          <h1
            className="text-7xl font-black text-white mb-2"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {winner.nickname}
          </h1>
          <p className="text-2xl text-gray-300 mb-8">conquers calculus!</p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl mb-8"
          style={{
            background: 'rgba(124, 58, 237, 0.2)',
            border: '1px solid rgba(124, 58, 237, 0.5)',
          }}
        >
          <span className="text-3xl">⚡</span>
          <span className="text-4xl font-black text-purple-400">
            {winner.score.toLocaleString()}
          </span>
          <span className="text-xl text-gray-400">points</span>
        </motion.div>

        {isHost && onPlayAgain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <button
              onClick={onPlayAgain}
              className="px-8 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
