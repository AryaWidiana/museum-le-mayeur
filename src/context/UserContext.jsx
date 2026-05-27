import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const UserContext = createContext(null)

const baseURL = import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const token = sessionStorage.getItem('admin_token')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // ─── Notification state ────────────────────────────────────
  const [notifications, setNotifications] = useState([])   // { id, name, time }
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestTxId, setLatestTxId] = useState(null)

  // ─── Fetch profile ─────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) { setUserLoading(false); return }
    try {
      const res = await fetch(`${baseURL}/auth/me`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok && data.success) setUser(data.data)
    } catch { /* ignore */ }
    finally { setUserLoading(false) }
  }, [])

  // ─── Update user (called from ProfilPage after PATCH) ─────
  const updateUser = useCallback((updated) => {
    setUser(updated)
  }, [])

  // ─── Fetch latest transaction for notification polling ─────
  const pollTransactions = useCallback(async () => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) return
    try {
      const res = await fetch(`${baseURL}/transactions?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success && data.data?.length > 0) {
        const newest = data.data[0]
        setLatestTxId(prev => {
          if (prev === null) {
            // First load — just track the ID silently
            return newest.id
          }
          if (newest.id !== prev) {
            // New transaction detected!
            const notif = {
              id: newest.id,
              name: newest.name || 'Pengunjung baru',
              category: newest.category?.name || '',
              type: newest.category?.type || '',
              time: new Date(newest.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
            setNotifications(n => [notif, ...n].slice(0, 10)) // keep last 10
            setUnreadCount(c => c + 1)
            return newest.id
          }
          return prev
        })
      }
    } catch { /* ignore polling errors */ }
  }, [])

  const clearNotifications = useCallback(() => {
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // ─── Start polling every 12 seconds ────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) return
    // Initial poll
    pollTransactions()
    const interval = setInterval(pollTransactions, 12000)
    return () => clearInterval(interval)
  }, [pollTransactions])

  return (
    <UserContext.Provider value={{
      user, userLoading, fetchUser, updateUser,
      notifications, unreadCount, clearNotifications,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
