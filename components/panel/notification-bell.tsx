'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

type Notification = { id: string; type: string; title: string; body: string; isRead: boolean; createdAt: string }

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  async function load() {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications || [])
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  async function markRead() {
    const unread = notifications.filter((n) => !n.isRead).map((n) => n.id)
    if (!unread.length) return
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unread }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markRead() }}
        className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all glass-subtle hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Bildirimler"
      >
        <span className="text-sm">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#f5576c,#f093fb)', fontSize: 9 }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-80 z-50 glass rounded-2xl shadow-2xl overflow-hidden border border-border/50">
            <div className="px-4 py-3 border-b border-border/50">
              <span className="text-sm font-semibold">Bildirimler</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Bildirim yok</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-border/30 last:border-0 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block mr-2 mb-0.5" />}
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
