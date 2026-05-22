'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

type Customer = {
  id: string
  companyName: string
  createdAt: Date
  user: { id: string; email: string; status: string }
  package: { name: string }
  _count: { messages: number; leads: number }
}

function statusBadge(s: string) {
  if (s === 'ACTIVE') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">Aktif</span>
  if (s === 'PENDING') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">Bekliyor</span>
  return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">Askıya Alındı</span>
}

function PasswordModal({ user, onClose }: { user: { id: string; email: string }; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 4) { toast.error('En az 4 karakter girin'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        toast.success(`${user.email} şifresi güncellendi`)
        onClose()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl stat-violet flex items-center justify-center text-lg shrink-0">🔑</div>
          <div>
            <h2 className="font-semibold text-sm">Şifre Sıfırla</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1.5">
              Yeni Şifre
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Yeni şifre girin"
              autoFocus
              className="w-full h-10 px-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
              İptal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-apple h-10 text-sm font-medium cursor-pointer disabled:opacity-40">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UyelerClient({ customers }: { customers: Customer[] }) {
  const [resetUser, setResetUser] = useState<{ id: string; email: string } | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Üyeler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{customers.length} kayıtlı müşteri</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border/60">
                {['Şirket', 'E-posta', 'Paket', 'Mesaj', 'Lead', 'Durum', 'Kayıt', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl stat-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.companyName[0]}
                      </div>
                      <span className="font-medium">{c.companyName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.user.email}</td>
                  <td className="px-5 py-3.5 text-xs">{c.package.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-primary">{c._count.messages}</td>
                  <td className="px-5 py-3.5 font-semibold text-green-500">{c._count.leads}</td>
                  <td className="px-5 py-3.5">{statusBadge(c.user.status)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setResetUser({ id: c.user.id, email: c.user.email })}
                      className="text-xs px-3 py-1.5 rounded-xl glass-subtle text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      🔑 Şifre
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground text-sm">Henüz üye yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {resetUser && <PasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
    </div>
  )
}
