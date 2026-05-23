import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { initSocketServer } from './src/lib/socket-server'
import type { ServerToClientEvents, ClientToServerEvents } from './src/types/game'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Prefer WebSocket; fall back to long-polling for restricted networks
    transports: ['websocket', 'polling'],
    // Prevent stale connections from accumulating
    pingTimeout: 20000,
    pingInterval: 25000,
  })

  initSocketServer(io)

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV ?? 'development'}`)
    console.log(`> Socket.IO attached on same port`)
  })
})
