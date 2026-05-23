'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import { Trophy, Loader2, AlertCircle } from 'lucide-react'

export default function HostPage() {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [status, setStatus] = useState<'idle' | 'connecting' | 'creating' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || status !== 'idle') return

    setStatus('creating')

    socket!.emit('host-game', (response) => {
      if (response.success && response.roomCode) {
        // Store room code in session storage for reconnect
        sessionStorage.setItem('lastOneStanding_hostRoom', response.roomCode)
        router.push(`/host/${response.roomCode}`)
      } else {
        setError(response.error ?? 'Failed to create game')
        setStatus('error')
      }
    })
  }, [isConnected, socket, status, router])

  useEffect(() => {
    if (!isConnected && status === 'idle') {
      setStatus('connecting')
    }
    if (isConnected && status === 'connecting') {
      setStatus('idle')
    }
  }, [isConnected, status])

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.1) 0%, #0a0a0f 60%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-6 max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
          >
            <Trophy size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Creating Your Game</h1>
        <p className="text-gray-400 mb-10">
          Setting up a new elimination room for your class...
        </p>

        {/* Status */}
        {status !== 'error' ? (
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={40} className="text-purple-400" />
            </motion.div>
            <p className="text-gray-300 font-medium">
              {status === 'connecting' ? 'Connecting to server...' : 'Creating game room...'}
            </p>
            <p className="text-gray-500 text-sm">This only takes a moment</p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-red-300 font-medium">{error}</p>
            <button
              onClick={() => {
                setStatus('idle')
                setError(null)
              }}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: '#7c3aed' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-left space-y-3">
          {[
            'A unique room code will be generated',
            'Share the code with students on-screen',
            'Students join at the play page',
            'You control when rounds start',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(124,58,237,0.3)', color: '#a78bfa' }}
              >
                {i + 1}
              </span>
              <p className="text-gray-400 text-sm">{step}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  )
}
