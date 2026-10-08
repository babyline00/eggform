'use client'

// WebSocket hook for EggForm real-time notifications.
// Connects to mini-services/realtime-service on port 3001 via the gateway
// (uses XTransformPort query param per fullstack-dev skill).
//
// Per engineering §58 (Notification Architecture):
//   - Event → Notification Service → Push / In-App / Email
//   - This hook handles in-app + pushes via socket.io

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useEggForm } from '@/lib/store'
import type { Notification } from '@/lib/types'

export function useRealtimeNotifications() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const user = useEggForm((s) => s.currentUser)
  const pushNotification = useEggForm((s) => s.pushNotification)

  useEffect(() => {
    if (!user) return

    // Connect via gateway with XTransformPort query param
    // Socket.io uses /socket.io/ path; gateway forwards to port 3001
    const socket = io('/?XTransformPort=3001', {
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      // Authenticate the socket with the user ID
      socket.emit('auth', { userId: user.id })
    })

    socket.on('disconnect', () => setIsConnected(false))
    socket.on('reconnect', () => {
      socket.emit('auth', { userId: user.id })
    })

    // Receive notifications
    socket.on('notification', (n: Notification) => {
      pushNotification(n.type, n.title, n.message)
      // Browser push notification (if permission granted)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(n.title, { body: n.message })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification(n.title, { body: n.message })
            }
          })
        }
      }
    })

    socket.on('auth_ok', ({ userId }: { userId: string }) => {
      console.log('[realtime] authenticated as', userId)
    })

    socket.on('error', (err: any) => {
      console.error('[realtime] error:', err)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [user?.id, pushNotification])

  // Request browser notification permission on first user interaction
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      const handler = () => {
        Notification.requestPermission()
        document.removeEventListener('click', handler)
      }
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }
  }, [])

  return { isConnected }
}
