'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md glass rounded-3xl p-10 shadow-2xl text-center space-y-4">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-xl font-bold">E-posta Gönderildi</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Eğer bu e-posta sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.
          Gelen kutunuzu kontrol edin (spam klasörünü de).
        </p>
        <Link href="/giris" className="btn-apple inline-block px-8 py-2.5 text-sm mt-2">
          Giriş Sayfasına Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <span className="text-xl">🔑</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Şifremi Unuttum</h1>
        <p className="text-muted-foreground text-sm">
          E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@sirket.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="btn-apple w-full h-11 mt-2 text-sm font-medium cursor-pointer">
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder →'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Şifrenizi hatırladınız mı?{' '}
        <Link href="/giris" className="text-primary font-medium hover:underline">Giriş Yap</Link>
      </p>
    </div>
  )
}
