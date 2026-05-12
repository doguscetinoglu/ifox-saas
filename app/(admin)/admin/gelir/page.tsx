'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Card3D } from '@/components/ui/card-3d'

type MonthData = { month: string; total: number }
type Payment = { id: string; amount: number; reviewedAt: string | null; createdAt: string; customer: { companyName: string } }
type RevenueData = { totalRevenue: number; customerCount: number; monthly: MonthData[]; payments: Payment[] }

function formatMonth(key: string) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}

export default function GelirPage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/revenue')
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

  const maxMonthly = Math.max(...(data.monthly.map((m) => m.total)), 1)
  const avgPayment = data.customerCount > 0 ? Math.round(data.totalRevenue / data.payments.length) : 0

  const summaryCards = [
    { label: 'Toplam Gelir', value: `₺${data.totalRevenue.toLocaleString('tr-TR')}`, sub: 'onaylanan ödemeler', gradient: 'stat-green', glow: 'green', icon: '💰' },
    { label: 'Ödeyen Müşteri', value: data.customerCount, sub: 'benzersiz müşteri', gradient: 'stat-blue', glow: 'blue', icon: '👥' },
    { label: 'Toplam İşlem', value: data.payments.length, sub: 'onaylanan ödeme', gradient: 'stat-violet', glow: 'violet', icon: '📋' },
    { label: 'Ortalama Ödeme', value: `₺${avgPayment.toLocaleString('tr-TR')}`, sub: 'işlem başına', gradient: 'stat-cyan', glow: 'cyan', icon: '📊' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gelir Raporu</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tüm onaylanmış ödemeler ve aylık gelir özeti</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className={`glow-${s.glow} rounded-2xl`}>
            <Card3D className={`${s.gradient} rounded-2xl p-5 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                  {s.icon}
                </div>
                <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse mt-1" />
              </div>
              <div className="text-2xl font-bold tracking-tight mb-0.5">{s.value}</div>
              <div className="text-xs font-semibold opacity-95 mt-1">{s.label}</div>
              <div className="text-xs opacity-55 mt-0.5">{s.sub}</div>
            </Card3D>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      {data.monthly.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <span>📈</span> Aylık Gelir
          </h2>
          <div className="flex items-end gap-3 h-40 overflow-x-auto pb-2">
            {data.monthly.map((m) => {
              const pct = Math.max(4, (m.total / maxMonthly) * 100)
              return (
                <div key={m.month} className="flex flex-col items-center gap-2 min-w-[56px] group">
                  <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₺{m.total.toLocaleString('tr-TR')}
                  </span>
                  <div className="w-10 rounded-t-xl transition-all duration-500 stat-blue"
                    style={{ height: `${pct}%`, minHeight: 6 }} />
                  <span className="text-xs text-muted-foreground text-center leading-tight whitespace-nowrap" style={{ fontSize: 10 }}>
                    {formatMonth(m.month)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payments table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2"><span>💳</span> Ödeme Geçmişi</h2>
          <span className="text-xs text-muted-foreground">{data.payments.length} kayıt</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {['Müşteri', 'Tutar', 'Tarih', 'Durum'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.payments.map((p) => (
              <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl stat-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {p.customer.companyName[0]}
                    </div>
                    <span className="font-medium text-sm">{p.customer.companyName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-bold text-green-500">₺{p.amount.toLocaleString('tr-TR')}</span>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                  {formatDate(p.reviewedAt ?? p.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    p.reviewedAt !== null
                      ? 'bg-green-500/15 text-green-500'
                      : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {p.reviewedAt !== null ? 'Onaylandı' : 'Bekliyor'}
                  </span>
                </td>
              </tr>
            ))}
            {data.payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  Henüz ödeme kaydı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
