'use client'
import { motion } from 'framer-motion'

interface TimerProps {
  timeRemaining: number
  timeLimit: number
  size?: number
}

export function Timer({ timeRemaining, timeLimit, size = 120 }: TimerProps) {
  const progress = Math.max(0, timeRemaining / timeLimit)
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const isUrgent = timeRemaining <= 5
  const isWarning = timeRemaining <= 10

  const color = progress > 0.6 ? '#10b981' : progress > 0.3 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
    >
      <svg width={size} height={size} className="absolute -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <motion.span
        className="relative text-3xl font-bold tabular-nums"
        style={{ color: isWarning ? color : 'white' }}
        animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
      >
        {timeRemaining}
      </motion.span>
    </motion.div>
  )
}
