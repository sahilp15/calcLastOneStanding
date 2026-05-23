'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import { HostDashboard } from '@/components/host/HostDashboard'
import type { GameState } from '@/types/game'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HostRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = (params.roomCode as string).toUpperCase()
  const { socket, isConnected } = useSocket()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [reconnecting, setReconnecting] = useState(true)

  // Reconnect host to room on mount / socket connect
  useEffect(() => {
    if (!socket || !isConnected) return

    socket.emit('host-reconnect', roomCode, (response) => {
      if (!response.success) {
        // Room not found; redirect to create new game
        toast.error('Game room not found. Creating a new one...')
        router.push('/host')
      } else {
        setReconnecting(false)
      }
    })
  }, [socket, isConnected, roomCode, router])

  // Listen to game state updates
  useEffect(() => {
    if (!socket) return

    const onGameState = (state: GameState) => setGameState(state)
    const onError = (data: { message: string }) => toast.error(data.message)
    const onGameOver = () => {
      // game-state will also come with status=ended, so just let the state handle it
    }

    socket.on('game-state', onGameState)
    socket.on('error', onError)
    socket.on('game-over', onGameOver)
    socket.on('player-joined', () => {
      // Player join toast
    })

    return () => {
      socket.off('game-state', onGameState)
      socket.off('error', onError)
      socket.off('game-over', onGameOver)
    }
  }, [socket])

  const handleStartGame = useCallback(() => {
    if (!socket) return
    socket.emit('host-start-game', roomCode)
  }, [socket, roomCode])

  const handleNextRound = useCallback(() => {
    if (!socket) return
    socket.emit('host-next-round', roomCode)
  }, [socket, roomCode])

  const handlePauseGame = useCallback(() => {
    if (!socket) return
    socket.emit('host-pause-game', roomCode)
    toast('Game paused', { icon: '⏸️' })
  }, [socket, roomCode])

  const handleEndGame = useCallback(() => {
    if (!socket) return
    const confirmed = window.confirm(
      'Are you sure you want to end the game? This cannot be undone.'
    )
    if (!confirmed) return
    socket.emit('host-end-game', roomCode)
  }, [socket, roomCode])

  if (!isConnected || reconnecting || !gameState) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Loader2 size={40} className="text-purple-400" />
          </motion.div>
          <p className="text-gray-400">
            {!isConnected ? 'Connecting to server...' : 'Loading game room...'}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <HostDashboard
      gameState={gameState}
      onStartGame={handleStartGame}
      onNextRound={handleNextRound}
      onPauseGame={handlePauseGame}
      onEndGame={handleEndGame}
    />
  )
}
