'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SifreSifirlaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="w-full max-w-md glass rounded-3xl p-10 shadow-2xl text-center space-y-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold">Geçersiz Bağlantı</h2>
        <p className="text-muted-foreground text-sm">Şifre sıfırlama bağlantısı geçersiz veya eksik.</p>
        <Link href="/sifremi-unuttum" className="btn-apple inline-block px-8 py-2.5 text-sm">
          Yeni Bağlantı İste
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md glass rounded-3xl p-10 shadow-2xl text-center space-y-4">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold">Şifre Güncellendi</h2>
        <p className="text-muted-foreground text-sm">Yeni şifrenizle giriş yapabilirsiniz.</p>
        <button onClick={() => router.push('/giris')} className="btn-apple px-8 py-2.5 text-sm cursor-pointer">
          Giriş Yap →
        </button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <span className="text-xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Yeni Şifre Belirle</h1>
        <p className="text-muted-foreground text-sm">En az 6 karakter uzunluğunda bir şifre girin.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Yeni Şifre
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Şifre Tekrar
          </Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="h-11 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="btn-apple w-full h-11 mt-2 text-sm font-medium cursor-pointer">
          {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle →'}
        </button>
      </form>
    </div>
  )
}

export default function SifreSifirlaPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md glass rounded-3xl p-10 text-center text-muted-foreground">Yükleniyor...</div>}>
      <SifreSifirlaForm />
    </Suspense>
  )
}
