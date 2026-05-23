'use client'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/game'

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let globalSocket: GameSocket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<GameSocket | null>(null)

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      })
    }

    socketRef.current = globalSocket

    const socket = socketRef.current

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    if (socket.connected) setIsConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return { socket: socketRef.current, isConnected }
}
