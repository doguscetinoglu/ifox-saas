'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'

type Reply = { id: string; content: string; sentAt: string; user: { name: string } }
type Message = {
  id: string
  senderName: string
  senderContact: string | null
  content: string
  receivedAt: string
  isLead: boolean
  status: string
  replies: Reply[]
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Yeni',
  REPLIED: 'Yanıtlandı',
  CLOSED: 'Kapatıldı',
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  REPLIED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
}

export default function MesajlarPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const selected = messages.find((m) => m.id === selectedId)

  async function load() {
    const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''
    const res = await fetch(`/api/messages${params}`)
    const data = await res.json()
    setMessages(data.messages || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter])
  useEffect(() => {
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [statusFilter])

  async function sendReply() {
    if (!selectedId || !replyText.trim()) return
    setSending(true)
    await fetch('/api/messages/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: selectedId, content: replyText }),
    })
    setReplyText('')
    setSending(false)
    load()
  }

  async function toggleLead(id: string, current: boolean) {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLead: !current }),
    })
    load()
  }

  async function closeMessage(id: string) {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLOSED' }),
    })
    load()
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Left: Message List */}
      <div className="w-80 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Mesajlar</h1>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'ALL')}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tümü</SelectItem>
              <SelectItem value="NEW">Yeni</SelectItem>
              <SelectItem value="REPLIED">Yanıtlandı</SelectItem>
              <SelectItem value="CLOSED">Kapatıldı</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Yükleniyor...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Mesaj bulunamadı.</p>
          )}
          {messages.map((m) => (
            <Card
              key={m.id}
              className={`cursor-pointer transition-colors ${selectedId === m.id ? 'border-primary' : 'hover:border-muted-foreground/30'}`}
              onClick={() => setSelectedId(m.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{m.senderName}</span>
                  <Badge className={`text-xs ${STATUS_COLORS[m.status]}`}>
                    {STATUS_LABELS[m.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{m.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground/60">{formatDate(m.receivedAt)}</span>
                  {m.isLead && <Badge variant="secondary" className="text-xs">Lead</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Message Detail */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Bir mesaj seçin
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">{selected.senderName}</h2>
                {selected.senderContact && (
                  <p className="text-sm text-muted-foreground">{selected.senderContact}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selected.isLead ? 'default' : 'outline'}
                  onClick={() => toggleLead(selected.id, selected.isLead)}
                >
                  {selected.isLead ? '🎯 Lead' : 'Lead İşaretle'}
                </Button>
                {selected.status !== 'CLOSED' && (
                  <Button size="sm" variant="outline" onClick={() => closeMessage(selected.id)}>
                    Kapat
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              <div className="bg-muted/50 rounded-lg p-3 max-w-lg">
                <p className="text-sm">{selected.content}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(selected.receivedAt)}</p>
              </div>
              {selected.replies.map((r) => (
                <div key={r.id} className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg p-3 max-w-lg">
                    <p className="text-xs text-muted-foreground mb-1">{r.user.name}</p>
                    <p className="text-sm">{r.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(r.sentAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {selected.status !== 'CLOSED' && (
              <>
                <Separator className="mb-3" />
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendReply()
                      }
                    }}
                  />
                  <Button onClick={sendReply} disabled={sending || !replyText.trim()}>
                    {sending ? '...' : 'Gönder'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
