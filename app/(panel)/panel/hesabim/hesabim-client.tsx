'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type User = {
  name: string
  email: string
  companyName: string | null
  phone: string | null
}

export default function HesabimClient({ user }: { user: User }) {
  const router = useRouter()
  const [tab, setTab] = useState<'profil' | 'sifre'>('profil')
  const [profil, setProfil] = useState({ name: user.name, companyName: user.companyName ?? '', phone: user.phone ?? '' })
  const [sifre, setSifre] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  async function saveProfil() {
    setLoading(true)
    try {
      const res = await fetch('/api/hesabim', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profil),
      })
      if (res.ok) {
        toast.success('Profil güncellendi')
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Hata oluştu')
      }
    } finally { setLoading(false) }
  }

  async function saveSifre() {
    if (sifre.next !== sifre.confirm) { toast.error('Şifreler eşleşmiyor'); return }
    if (sifre.next.length < 6) { toast.error('Şifre en az 6 karakter olmalı'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/hesabim/sifre', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: sifre.current, next: sifre.next }),
      })
      if (res.ok) {
        toast.success('Şifre güncellendi')
        setSifre({ current: '', next: '', confirm: '' })
      } else {
        const d = await res.json()
        toast.error(d.error || 'Hata oluştu')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">👤 Hesabım</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-border/60">
          {(['profil', 'sifre'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-sm font-medium py-3 transition-colors cursor-pointer ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {t === 'profil' ? 'Profil Bilgileri' : 'Şifre Değiştir'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'profil' ? (
            <div className="space-y-4">
              {[
                { label: 'Ad Soyad', key: 'name', placeholder: 'Adınız soyadınız' },
                { label: 'Şirket Adı', key: 'companyName', placeholder: 'Şirket adı (opsiyonel)' },
                { label: 'Telefon', key: 'phone', placeholder: '05xx xxx xx xx (opsiyonel)' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
                  <input type="text" placeholder={placeholder} value={profil[key as keyof typeof profil]}
                    onChange={(e) => setProfil((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <button onClick={saveProfil} disabled={loading}
                className="w-full btn-apple h-10 text-sm rounded-xl cursor-pointer disabled:opacity-40 mt-2">
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Mevcut Şifre', key: 'current' },
                { label: 'Yeni Şifre', key: 'next' },
                { label: 'Yeni Şifre (Tekrar)', key: 'confirm' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
                  <input type="password" value={sifre[key as keyof typeof sifre]}
                    onChange={(e) => setSifre((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <button onClick={saveSifre} disabled={loading}
                className="w-full btn-apple h-10 text-sm rounded-xl cursor-pointer disabled:opacity-40 mt-2">
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
