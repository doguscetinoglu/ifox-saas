'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

type AutoReq = { id: string; description: string; isExtra: boolean; status: string; createdAt: string }

const STATUS_LABELS: Record<string, string> = { PENDING: 'Bekliyor', IN_PROGRESS: 'Devam Ediyor', DONE: 'Tamamlandı', REJECTED: 'Reddedildi' }
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-500',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-500',
  DONE: 'bg-green-500/15 text-green-500',
  REJECTED: 'bg-red-500/15 text-red-500',
}
const FREE_LIMIT = 2

export default function OtomasyonTalebiPage() {
  const [requests, setRequests] = useState<AutoReq[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/automation')
    const data = await res.json()
    setRequests(data.requests || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function submit() {
    if (!description.trim()) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
    if (res.ok) { setDescription(''); load() }
    else { const d = await res.json(); setError(d.error || 'Hata oluştu') }
    setSubmitting(false)
  }

  const usedFree = requests.filter((r) => !r.isExtra).length
  const isExtraNext = usedFree >= FREE_LIMIT
  const pct = Math.min((usedFree / FREE_LIMIT) * 100, 100)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Otomasyon Talebi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">N8N iş akışı talepleri</p>
      </div>

      {/* Usage */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Ücretsiz Kullanım</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full glass-subtle">
            {usedFree}/{FREE_LIMIT} kullanıldı
          </span>
        </div>
        <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: isExtraNext ? 'linear-gradient(90deg,#f5576c,#f093fb)' : 'linear-gradient(90deg,#4facfe,#00f2fe)' }} />
        </div>
        {isExtraNext && (
          <p className="text-xs text-amber-500 mt-3">
            ⚠️ Ücretsiz hakkınız doldu. Sonraki talep ücretli olacak — fiyat için sizinle iletişime geçeceğiz.
          </p>
        )}
      </div>

      {/* New request */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4">Yeni Talep</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Hangi otomasyonu istediğinizi detaylıca açıklayın..."
          rows={4}
          className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-black/3 dark:bg-white/4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        {isExtraNext && (
          <p className="text-xs text-muted-foreground mt-2">
            Bu talep <strong>ücretli</strong> olarak işlenecektir.
          </p>
        )}
        <button onClick={submit} disabled={submitting || !description.trim()}
          className="btn-apple mt-4 px-6 h-10 text-sm font-medium cursor-pointer disabled:opacity-40">
          {submitting ? 'Gönderiliyor...' : '🚀 Talep Gönder'}
        </button>
      </div>

      {/* History */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4">Talep Geçmişi</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Henüz talep yok.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="glass-subtle rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status}
                    </span>
                    {r.isExtra && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">Ücretli</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
