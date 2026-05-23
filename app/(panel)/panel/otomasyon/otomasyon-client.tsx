'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type Talep = {
  id: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'REJECTED'
  notes: string | null
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Beklemede', cls: 'bg-amber-500/15 text-amber-500' },
  IN_PROGRESS: { label: 'İşlemde', cls: 'bg-blue-500/15 text-blue-500' },
  DONE: { label: 'Tamamlandı', cls: 'bg-green-500/15 text-green-500' },
  REJECTED: { label: 'Reddedildi', cls: 'bg-red-500/15 text-red-500' },
}

export default function OtomasyonClient({ talepler: initial }: { talepler: Talep[] }) {
  const [talepler, setTalepler] = useState(initial)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!description.trim()) { toast.error('Açıklama girin'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/otomasyon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      if (res.ok) {
        const t = await res.json()
        setTalepler((prev) => [t, ...prev])
        setDescription('')
        toast.success('Talep gönderildi. Ekibimiz en kısa sürede iletişime geçecek.')
      } else {
        toast.error('Hata oluştu')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">🤖 Sosyal Medya Otomasyonu</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Uzman ekibimiz sizin için özel otomasyon kurar</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-sm mb-1">Nasıl Çalışır?</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 mt-3">
          {[
            'Otomasyon ihtiyacınızı aşağıda açıklayın',
            'Ekibimiz 24 saat içinde sizinle iletişime geçer',
            'Gereksinim analizi yapılır ve kurulum planlanır',
            'Uzmanlarımız Instagram, Facebook ve diğer platformlarda otomasyonu kurar',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-sm mb-3">Yeni Otomasyon Talebi</h2>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Neye ihtiyacınız var?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Hangi platformda, ne tür bir otomasyon istiyorsunuz? Detaylı açıklayın..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <button onClick={handleSubmit} disabled={loading}
          className="mt-3 btn-apple px-6 py-2.5 text-sm rounded-xl cursor-pointer disabled:opacity-40">
          {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
        </button>
      </div>

      {talepler.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/60">
            <h2 className="text-sm font-semibold">Taleplerim</h2>
          </div>
          <div className="divide-y divide-border/30">
            {talepler.map((t) => {
              const s = STATUS_MAP[t.status]
              return (
                <div key={t.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm">{t.description || '—'}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                  </div>
                  {t.notes && (
                    <p className="text-xs text-muted-foreground mt-2 bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2">
                      📝 {t.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
