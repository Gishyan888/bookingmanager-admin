import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { io } from 'socket.io-client'
import { notifications as notificationsApi } from '../api/endpoints'
import { useAuth } from './AuthContext'
import { playNotificationSound } from '../utils/playNotificationSound'
import { getSocketOrigin } from '../utils/socketOrigin'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, loading } = useAuth()
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef(null)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('bm_token')
    if (!token) return
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list({ limit: 40, page: 1 }),
        notificationsApi.unreadCount(),
      ])
      setItems(listRes.data ?? [])
      setUnreadCount(countRes.count ?? 0)
    } catch {
      /* keep existing state */
    }
  }, [])

  useEffect(() => {
    if (!user || loading) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setItems([])
      setUnreadCount(0)
      return
    }

    const token = localStorage.getItem('bm_token')
    if (!token) return

    const origin = getSocketOrigin()
    const socket = io(`${origin}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    const onNotification = (payload) => {
      setItems((prev) => {
        const rest = prev.filter((p) => p.id !== payload.id)
        return [payload, ...rest].slice(0, 80)
      })
      if (!payload.readAt) {
        setUnreadCount((c) => c + 1)
        playNotificationSound()
      }
    }

    socket.on('notification', onNotification)
    socket.on('connect', () => {
      void refresh()
    })

    return () => {
      socket.off('notification', onNotification)
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [user, loading, refresh])

  const markRead = useCallback(async (id) => {
    const updated = await notificationsApi.markRead(id)
    const readAtIso = updated.readAt
      ? new Date(updated.readAt).toISOString()
      : null
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: readAtIso } : n)),
    )
    const { count } = await notificationsApi.unreadCount()
    setUnreadCount(count)
    return updated
  }, [])

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead()
    setItems((prev) =>
      prev.map((n) => ({
        ...n,
        readAt: n.readAt || new Date().toISOString(),
      })),
    )
    setUnreadCount(0)
  }, [])

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, refresh, markRead, markAllRead],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx)
    throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}
