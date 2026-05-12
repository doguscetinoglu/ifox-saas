'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Card3D } from '@/components/ui/card-3d'

type Package = { name: string; price: number; automationLimit: number }
type Payment = { id: string; amount: number; status: string; createdAt: string; reviewedAt: string | null }
type AccountData = {
  companyName: string
  approvedAt: string | null
  package: Package
  automationRequestCount: number
  totalPaid: number
  payments: Payment[]
}

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Onaylandı', color: 'bg-green-500/15 text-green-500' },
  PENDING: { label: 'Bekliyor', color: 'bg-amber-500/15 text-amber-500' },
  REJECTED: { label: 'Reddedildi', color: 'bg-red-500/15 text-red-500' },
}

export default function HesapPage() {
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/panel/account')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const usedAutomations = data.automationRequestCount
  const freeLimit = data.package.automationLimit
  const freeUsed = Math.min(usedAutomations, freeLimit)
  const extraUsed = Math.max(0, usedAutomations - freeLimit)
  const automationPct = freeLimit > 0 ? Math.min(100, (freeUsed / freeLimit) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hesabım</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Plan ve ödeme bilgileriniz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Plan card */}
        <div className="lg:col-span-1 glow-violet rounded-2xl">
          <Card3D className="stat-violet rounded-2xl p-6 text-white h-full">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                💎
              </div>
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">Aktif</span>
            </div>
            <div className="space-y-1 mb-6">
              <p className="text-xs uppercase tracking-widest opacity-70 font-semibold">Mevcut Paket</p>
              <h2 className="text-2xl font-bold">{data.package.name}</h2>
              <p className="text-3xl font-bold">
                ₺{data.package.price.toLocaleString('tr-TR')}
                <span className="text-sm font-normal opacity-70">/ay</span>
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 opacity-90">
                <span>✅</span> Instagram DM Yönetimi
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <span>✅</span> Lead Takibi
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <span>✅</span> Raporlama
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <span>✅</span> {data.package.automationLimit} Ücretsiz Otomasyon
              </div>
            </div>
            {data.approvedAt && (
              <p className="text-xs opacity-50 mt-6">Üyelik: {formatDate(data.approvedAt)}</p>
            )}
          </Card3D>
        </div>

        {/* Stats + automation usage */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 gradient-border">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-500">
                ₺{data.totalPaid.toLocaleString('tr-TR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Toplam Ödeme</p>
            </div>
            <div className="glass rounded-2xl p-5 gradient-border">
              <div className="text-2xl mb-2">🧾</div>
              <div className="text-2xl font-bold text-primary">
                {data.payments.filter((p) => p.status === 'APPROVED').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Onaylanan Ödeme</p>
            </div>
          </div>

          {/* Automation usage */}
          <div className="glass rounded-2xl p-5 gradient-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <h3 className="text-sm font-semibold">Otomasyon Kullanımı</h3>
              </div>
              <span className="text-xs font-semibold text-primary">{freeUsed}/{freeLimit} ücretsiz</span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${automationPct}%`,
                  background: automationPct >= 100 ? 'linear-gradient(90deg,#f5576c,#f093fb)' : 'linear-gradient(90deg,#7c7cf8,#a78bfa)',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{freeUsed} adet ücretsiz kullanıldı</span>
              {extraUsed > 0 && (
                <span className="text-rose-500 font-medium">+{extraUsed} ücretli talep</span>
              )}
              {usedAutomations < freeLimit && (
                <span className="text-green-500 font-medium">{freeLimit - usedAutomations} adet kaldı</span>
              )}
            </div>
          </div>

          {/* Company info */}
          <div className="glass rounded-2xl p-5 gradient-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🏢</span>
              <h3 className="text-sm font-semibold">Şirket Bilgileri</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl stat-indigo flex items-center justify-center text-white text-xl font-bold shrink-0">
                {data.companyName[0]}
              </div>
              <div>
                <p className="font-semibold">{data.companyName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.approvedAt ? `${formatDate(data.approvedAt)} tarihinden beri üye` : 'Üyelik onay bekliyor'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2"><span>📋</span> Ödeme Geçmişi</h2>
          <span className="text-xs text-muted-foreground">{data.payments.length} işlem</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-border/60">
              {['Tarih', 'Tutar', 'Durum'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.payments.map((p) => {
              const st = PAYMENT_STATUS[p.status] ?? { label: p.status, color: 'bg-muted text-muted-foreground' }
              return (
                <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-bold ${p.status === 'APPROVED' ? 'text-green-500' : 'text-foreground'}`}>
                      ₺{p.amount.toLocaleString('tr-TR')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  </td>
                </tr>
              )
            })}
            {data.payments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  Henüz ödeme kaydı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
