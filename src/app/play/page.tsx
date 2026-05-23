'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function PlayPage() {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nicknameRef = useRef<HTMLInputElement>(null)

  const handleRoomCodeChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setRoomCode(cleaned)
    if (cleaned.length === 6) nicknameRef.current?.focus()
  }

  const handleJoin = async () => {
    setError(null)

    if (roomCode.length < 4) {
      setError('Please enter a valid room code')
      return
    }
    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters')
      return
    }
    if (nickname.trim().length > 24) {
      setError('Nickname must be 24 characters or less')
      return
    }
    if (!isConnected || !socket) {
      setError('Not connected to server. Please wait...')
      return
    }

    setIsJoining(true)

    socket.emit(
      'join-game',
      { roomCode: roomCode.trim(), nickname: nickname.trim() },
      (response) => {
        setIsJoining(false)
        if (response.success && response.playerId) {
          // Store for reconnection
          localStorage.setItem('lastOneStanding_playerId', response.playerId)
          localStorage.setItem('lastOneStanding_roomCode', roomCode.trim())
          localStorage.setItem('lastOneStanding_nickname', nickname.trim())
          toast.success(`Joined as ${nickname.trim()}!`)
          router.push(`/play/${roomCode.trim()}`)
        } else {
          setError(response.error ?? 'Failed to join game')
        }
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining) handleJoin()
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.1) 0%, #0a0a0f 60%)',
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
            >
              <Users size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Join a Game</h1>
            <p className="text-gray-400">
              Enter the room code displayed in class
            </p>
          </div>

          {/* Form Card */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
          >
            {/* Room Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Room Code
              </label>
              <input
                value={roomCode}
                onChange={(e) => handleRoomCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ABCD12"
                maxLength={6}
                className="w-full text-center text-3xl font-black tracking-[0.3em] rounded-xl border bg-transparent py-4 transition-colors placeholder:text-gray-600"
                style={{
                  borderColor: roomCode.length === 6 ? '#06b6d4' : '#1e1e2e',
                  color: roomCode.length === 6 ? '#06b6d4' : 'white',
                  outline: 'none',
                }}
                autoFocus
              />
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Your Nickname
              </label>
              <Input
                ref={nicknameRef}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. MathWiz42"
                maxLength={24}
              />
              <p className="text-xs text-gray-500">
                {nickname.length}/24 characters
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                }}
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Connection status */}
            {!isConnected && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Loader2 size={14} className="animate-spin" />
                Connecting to server...
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleJoin}
              disabled={isJoining || !isConnected}
              size="xl"
              className="w-full gap-2"
              style={{
                background: isJoining
                  ? '#1e1e2e'
                  : 'linear-gradient(135deg, #06b6d4, #0891b2)',
              }}
            >
              {isJoining ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Game
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
