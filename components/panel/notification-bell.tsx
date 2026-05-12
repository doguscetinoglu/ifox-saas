'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])

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
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none"
        onClick={markRead}
      >
        🔔
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground text-center">Bildirim yok</div>
        )}
        {notifications.slice(0, 10).map((n) => (
          <DropdownMenuItem key={n.id} className={`flex-col items-start gap-1 ${!n.isRead ? 'bg-muted/50' : ''}`}>
            <span className="font-medium text-sm">{n.title}</span>
            <span className="text-xs text-muted-foreground">{n.body}</span>
            <span className="text-xs text-muted-foreground/60">{formatDate(n.createdAt)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
