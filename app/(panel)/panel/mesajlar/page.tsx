'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const STATUS_LABELS: Record<string, string> = { NEW: 'Yeni', REPLIED: 'Yanıtlandı', CLOSED: 'Kapatıldı' }
const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-primary/15 text-primary',
  REPLIED: 'bg-blue-500/15 text-blue-500',
  CLOSED: 'bg-muted text-muted-foreground',
}

export default function MesajlarPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const selected = messages.find((m) => m.id === selectedId)
  const showDetail = selectedId !== null

  async function load() {
    const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''
    const res = await fetch(`/api/messages${params}`)
    const data = await res.json()
    setMessages(data.messages || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter])
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t) }, [statusFilter])

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
    <div className="flex flex-col md:flex-row gap-4" style={{ height: 'calc(100dvh - 7rem)' }}>

      {/* ── Message list ─────────────────────────────── */}
      <div className={`flex-col gap-3 md:w-72 md:shrink-0 ${showDetail ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Mesajlar</h1>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'ALL')}>
            <SelectTrigger className="w-28 h-8 text-xs rounded-xl border-border">
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

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="glass rounded-2xl py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm text-muted-foreground">Mesaj bulunamadı.</p>
            </div>
          )}
          {messages.map((m) => (
            <button key={m.id} onClick={() => setSelectedId(m.id)} className="w-full text-left">
              <div className={`glass rounded-2xl p-3.5 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                selectedId === m.id ? 'ring-1 ring-primary/50 bg-primary/5' : ''
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg stat-rose flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {m.senderName[0]}
                    </div>
                    <span className="font-medium text-sm truncate max-w-[120px]">{m.senderName}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[m.status]}`}>
                    {STATUS_LABELS[m.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 ml-9">{m.content}</p>
                <div className="flex items-center gap-2 mt-1.5 ml-9">
                  <span className="text-xs text-muted-foreground/60">{formatDate(m.receivedAt)}</span>
                  {m.isLead && (
                    <span className="text-xs bg-green-500/15 text-green-500 px-1.5 rounded-full font-medium">Lead</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Message detail ───────────────────────────── */}
      <div className={`flex-1 flex-col ${showDetail ? 'flex' : 'hidden md:flex'}`}>
        {!selected ? (
          <div className="hidden md:flex flex-1 items-center justify-center glass rounded-2xl">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-30">💬</div>
              <p className="text-sm text-muted-foreground">Sol taraftan bir mesaj seçin</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                {/* Back button — mobile only */}
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center glass-subtle mr-1 active:scale-95 transition-all"
                  aria-label="Geri"
                >
                  ←
                </button>
                <div className="w-8 h-8 rounded-xl stat-rose flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {selected.senderName[0]}
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{selected.senderName}</h2>
                  {selected.senderContact && (
                    <p className="text-xs text-muted-foreground">{selected.senderContact}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleLead(selected.id, selected.isLead)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    selected.isLead
                      ? 'bg-green-500/15 text-green-500'
                      : 'glass-subtle text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {selected.isLead ? '🎯 Lead' : 'Lead Ekle'}
                </button>
                {selected.status !== 'CLOSED' && (
                  <button
                    onClick={() => closeMessage(selected.id)}
                    className="text-xs px-3 py-1.5 rounded-xl glass-subtle text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    Kapat
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-3.5 max-w-xs lg:max-w-sm">
                <p className="text-sm leading-relaxed">{selected.content}</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">{formatDate(selected.receivedAt)}</p>
              </div>
              {selected.replies.map((r) => (
                <div key={r.id} className="flex justify-end">
                  <div className="bg-primary/10 rounded-2xl rounded-tr-sm p-3.5 max-w-xs lg:max-w-sm">
                    <p className="text-xs text-primary font-medium mb-1">{r.user.name}</p>
                    <p className="text-sm leading-relaxed">{r.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">{formatDate(r.sentAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply area */}
            {selected.status !== 'CLOSED' && (
              <div className="p-3 border-t border-border/50 flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Yanıtınızı yazın... (Enter = gönder)"
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-border bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="btn-apple px-4 text-sm self-end py-2.5 disabled:opacity-40 cursor-pointer"
                >
                  {sending ? '...' : '→'}
                </button>
              </div>
            )}
            {selected.status === 'CLOSED' && (
              <div className="p-3 border-t border-border/50 text-center text-xs text-muted-foreground">
                Bu mesaj kapatıldı.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
