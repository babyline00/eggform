// EggForm Real-Time Service (port 3001)
//
// Provides WebSocket-based real-time notifications for:
//   - egg_ready           (formation complete, ready to hatch)
//   - production_ready    (animal produced new resources)
//   - marketplace_sale    (your listing was bought)
//   - deposit_completed   (PKR deposit confirmed by webhook)
//   - withdrawal_update   (withdrawal status changed)
//   - mission_complete    (mission target reached)
//   - event_started       (special event began)
//   - security_alert      (suspicious activity flagged)
//
// Per fullstack-dev skill: backend logic on port 3001, frontend connects via
// io("/?XTransformPort=3001"). NEVER use direct localhost URLs.

import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3001

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'eggform-realtime',
      port: PORT,
      connections: io?.engine.clientsCount || 0,
      uptime: process.uptime(),
    }))
    return
  }
  res.writeHead(404)
  res.end('Not Found')
})

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  // Only handle socket.io on /socket.io path; let /health and / pass through to http server
  path: '/socket.io/',
})

// In-memory per-user notification queue (production: use Redis)
// Maps userId -> array of pending notifications
const userNotifications = new Map<string, any[]>()

// Track which users are currently connected
const connectedUsers = new Map<string, Set<string>>() // userId -> Set<socketId>

io.on('connection', (socket) => {
  console.log(`[realtime] socket connected: ${socket.id}`)

  // Client sends: { event: 'auth', userId: 'usr-xxx' }
  socket.on('auth', (payload: { userId?: string }) => {
    if (!payload?.userId) {
      socket.emit('error', { message: 'Missing userId' })
      return
    }
    const userId = payload.userId
    socket.data.userId = userId
    socket.join(`user:${userId}`)

    // Track connection
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set())
    }
    connectedUsers.get(userId)!.add(socket.id)

    console.log(`[realtime] user ${userId} authenticated on socket ${socket.id}`)

    // Flush any queued notifications for this user
    const queued = userNotifications.get(userId) || []
    queued.forEach((n) => socket.emit('notification', n))
    userNotifications.delete(userId)

    socket.emit('auth_ok', { userId })
  })

  // Internal: emit notification to a specific user
  socket.on('emit_to_user', (payload: {
    userId: string
    type: string
    title: string
    message: string
    data?: any
  }) => {
    const { userId, type, title, message, data } = payload
    const notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      data,
      createdAt: Date.now(),
    }
    // If user is connected, emit immediately; else queue
    const connected = connectedUsers.get(userId)
    if (connected && connected.size > 0) {
      io.to(`user:${userId}`).emit('notification', notification)
      console.log(`[realtime] emitted ${type} to user ${userId} (live)`)
    } else {
      if (!userNotifications.has(userId)) {
        userNotifications.set(userId, [])
      }
      userNotifications.get(userId)!.push(notification)
      console.log(`[realtime] queued ${type} for user ${userId} (offline)`)
    }
  })

  // Internal: broadcast platform-wide event
  socket.on('broadcast', (payload: { type: string; title: string; message: string; data?: any }) => {
    const { type, title, message, data } = payload
    const notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      data,
      createdAt: Date.now(),
    }
    io.emit('notification', notification)
    console.log(`[realtime] broadcast ${type} to all users`)
  })

  socket.on('disconnect', () => {
    const userId = socket.data.userId
    if (userId) {
      const set = connectedUsers.get(userId)
      if (set) {
        set.delete(socket.id)
        if (set.size === 0) {
          connectedUsers.delete(userId)
        }
      }
    }
    console.log(`[realtime] socket disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🥚 EggForm Real-Time Service running on port ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
})

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('[realtime] shutting down...')
  io.close()
  httpServer.close()
  process.exit(0)
})
