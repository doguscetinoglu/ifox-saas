'use client'

import { useState } from 'react'

export default function OdemePage() {
  const [notified, setNotified] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleNotify() {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/notify', { method: 'POST' })
      if (res.ok) setNotified(true)
    } finally {
      setLoading(false)
    }
  }

  if (notified) {
    return (
      <div className="w-full max-w-md glass rounded-3xl p-10 shadow-2xl text-center space-y-4">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold">Ödeme Bildirimi Alındı</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ödemeniz inceleniyor. Onaylandığında e-posta alacaksınız.
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
    <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <span className="text-2xl">💳</span>
        </div>
        <h1 className="text-2xl font-bold">Ödeme Bilgileri</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aşağıdaki IBAN&apos;a <strong className="text-foreground">₺2.000</strong> transfer yapın
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {[
          { label: 'Banka', value: process.env.NEXT_PUBLIC_IBAN_BANK || 'Banka Adı' },
          { label: 'Hesap Sahibi', value: process.env.NEXT_PUBLIC_IBAN_HOLDER || 'Ad Soyad' },
          { label: 'Tutar', value: '₺2.000' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl glass-subtle">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className="text-sm font-semibold">{value}</span>
          </div>
        ))}
        <div className="px-4 py-3 rounded-xl glass-subtle">
          <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">IBAN</span>
          <span className="text-sm font-mono font-semibold break-all">
            {process.env.NEXT_PUBLIC_IBAN_NUMBER || 'TR00 0000 0000 0000 0000 0000 00'}
          </span>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 mb-6 text-xs leading-relaxed"
        style={{ background: 'rgba(250, 130, 49, 0.12)', color: '#fa8231' }}>
        Transfer açıklamasına <strong>iFox Social</strong> yazmayı unutmayın. Ödeme sonrası aşağıdaki butona tıklayın.
      </div>

      <button onClick={handleNotify} disabled={loading}
        className="btn-apple w-full h-12 text-sm font-medium cursor-pointer">
        {loading ? 'Bildiriliyor...' : '💳 Ödemeyi Bildirdim'}
      </button>
    </div>
  )
}
