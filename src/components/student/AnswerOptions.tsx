'use client'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { MathRenderer } from '@/components/shared/MathRenderer'

interface AnswerOptionsProps {
  options: string[]
  selected: string | null
  correctAnswer?: string | null
  disabled: boolean
  onSelect: (option: string) => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_COLORS = [
  { border: '#7c3aed', bg: 'rgba(124,58,237,0.15)', glow: 'rgba(124,58,237,0.3)' },
  { border: '#06b6d4', bg: 'rgba(6,182,212,0.15)', glow: 'rgba(6,182,212,0.3)' },
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.3)' },
  { border: '#ec4899', bg: 'rgba(236,72,153,0.15)', glow: 'rgba(236,72,153,0.3)' },
]

export function AnswerOptions({
  options,
  selected,
  correctAnswer,
  disabled,
  onSelect,
}: AnswerOptionsProps) {
  const isRevealed = correctAnswer != null

  const getStyle = (option: string, index: number) => {
    const isSelected = selected === option
    const isCorrect = option === correctAnswer
    const isWrong = isSelected && isRevealed && !isCorrect

    if (isRevealed) {
      if (isCorrect) {
        return {
          background: 'rgba(16,185,129,0.2)',
          border: '2px solid #10b981',
          boxShadow: '0 0 20px rgba(16,185,129,0.3)',
          cursor: 'default',
        }
      }
      if (isWrong) {
        return {
          background: 'rgba(239,68,68,0.15)',
          border: '2px solid #ef4444',
          boxShadow: '0 0 20px rgba(239,68,68,0.2)',
          cursor: 'default',
          opacity: 0.8,
        }
      }
      return {
        background: 'rgba(255,255,255,0.02)',
        border: '2px solid #1e1e2e',
        cursor: 'default',
        opacity: 0.4,
      }
    }

    if (isSelected) {
      const color = OPTION_COLORS[index]
      return {
        background: color.bg,
        border: `2px solid ${color.border}`,
        boxShadow: `0 0 20px ${color.glow}`,
        cursor: 'default',
      }
    }

    return {
      background: 'rgba(255,255,255,0.03)',
      border: '2px solid #1e1e2e',
      cursor: disabled ? 'default' : 'pointer',
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option, index) => {
        const isSelected = selected === option
        const isCorrect = option === correctAnswer
        const isWrong = isSelected && isRevealed && !isCorrect

        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: 'spring', damping: 20 }}
            whileHover={!disabled && !isRevealed ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled && !isRevealed ? { scale: 0.98 } : {}}
            onClick={() => !disabled && !isRevealed && onSelect(option)}
            className="relative p-5 rounded-2xl text-left transition-all duration-200 min-h-[80px] flex items-center gap-4"
            style={getStyle(option, index)}
            disabled={disabled && !isRevealed}
          >
            {/* Option label */}
            <span
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
              style={{
                background:
                  isCorrect && isRevealed
                    ? '#10b981'
                    : isWrong
                    ? '#ef4444'
                    : isSelected && !isRevealed
                    ? OPTION_COLORS[index].border
                    : '#1e1e2e',
                color: 'white',
              }}
            >
              {OPTION_LABELS[index]}
            </span>

            {/* Math content */}
            <div className="flex-1 overflow-hidden">
              <MathRenderer latex={option} className="text-base" />
            </div>

            {/* Result icon */}
            {isRevealed && isCorrect && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />
              </motion.div>
            )}
            {isRevealed && isWrong && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <XCircle size={22} className="text-red-400 flex-shrink-0" />
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
