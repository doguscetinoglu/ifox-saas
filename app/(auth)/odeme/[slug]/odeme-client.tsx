'use client'

import { useState } from 'react'

export default function OdemeClient({ productId }: { productId: string }) {
  const [notified, setNotified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleNotify() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu')
        return
      }
      setNotified(true)
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (notified) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-lg font-bold">Ödeme Bildirimi Alındı</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ödemeniz inceleniyor. Onaylandığında erişim açılacak.
          Ortalama onay süresi <strong>1–4 saattir.</strong>
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          İnceleniyor
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive text-center bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>
      )}
      <button onClick={handleNotify} disabled={loading}
        className="btn-apple w-full h-12 text-sm font-medium cursor-pointer disabled:opacity-60">
        {loading ? 'Bildiriliyor...' : '💳 Ödemeyi Bildirdim'}
      </button>
    </div>
  )
}
