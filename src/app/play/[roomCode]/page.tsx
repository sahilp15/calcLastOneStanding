'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import { StudentGame } from '@/components/student/StudentGame'
import type { GameState } from '@/types/game'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PlayRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = (params.roomCode as string).toUpperCase()
  const { socket, isConnected } = useSocket()

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reconnect or redirect on mount
  useEffect(() => {
    if (!socket || !isConnected) return

    const storedPlayerId = localStorage.getItem('lastOneStanding_playerId')
    const storedRoomCode = localStorage.getItem('lastOneStanding_roomCode')
    const storedNickname = localStorage.getItem('lastOneStanding_nickname')

    if (
      storedPlayerId &&
      storedRoomCode?.toUpperCase() === roomCode &&
      storedNickname
    ) {
      // Try to reconnect
      setNickname(storedNickname)
      socket.emit(
        'reconnect-player',
        { roomCode, playerId: storedPlayerId },
        (response) => {
          if (response.success) {
            setPlayerId(storedPlayerId)
            setIsLoading(false)
          } else {
            // Reconnect failed, redirect to join page
            toast.error('Session expired. Please rejoin.')
            router.push(`/play?room=${roomCode}`)
          }
        }
      )
    } else {
      // No stored session — redirect to join
      router.push('/play')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  // Listen for game state updates
  useEffect(() => {
    if (!socket) return

    const onGameState = (state: GameState) => {
      setGameState(state)
      setIsLoading(false)
    }
    const onError = (data: { message: string }) => {
      toast.error(data.message)
      setError(data.message)
    }
    const onRoundEnd = () => {
      // round-end is followed by game-state, so just let state update handle it
    }

    socket.on('game-state', onGameState)
    socket.on('error', onError)
    socket.on('round-end', onRoundEnd)

    return () => {
      socket.off('game-state', onGameState)
      socket.off('error', onError)
      socket.off('round-end', onRoundEnd)
    }
  }, [socket])

  const handleSubmitAnswer = useCallback(
    (answer: string) => {
      if (!socket) return
      socket.emit('submit-answer', { answer })
    },
    [socket]
  )

  if (!isConnected) {
    return (
      <LoadingScreen message="Connecting to server..." />
    )
  }

  if (isLoading) {
    return <LoadingScreen message="Rejoining game..." />
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <div className="text-center p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/play"
            className="px-6 py-3 rounded-xl text-white font-bold"
            style={{ background: '#7c3aed' }}
          >
            Back to Join
          </a>
        </div>
      </div>
    )
  }

  if (!gameState || !playerId) {
    return <LoadingScreen message="Loading game state..." />
  }

  return (
    <StudentGame
      gameState={gameState}
      playerId={playerId}
      nickname={nickname}
      onSubmitAnswer={handleSubmitAnswer}
    />
  )
}

function LoadingScreen({ message }: { message: string }) {
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
          <Loader2 size={40} className="text-cyan-400" />
        </motion.div>
        <p className="text-gray-400">{message}</p>
      </motion.div>
    </div>
  )
}
