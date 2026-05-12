'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

type AutoReq = { id: string; description: string; isExtra: boolean; status: string; createdAt: string; customer: { companyName: string } }

const STATUS_LABELS: Record<string, string> = { PENDING: 'Bekliyor', IN_PROGRESS: 'Devam Ediyor', DONE: 'Tamamlandı', REJECTED: 'Reddedildi' }
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-500',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-500',
  DONE: 'bg-green-500/15 text-green-500',
  REJECTED: 'bg-red-500/15 text-red-500',
}

export default function OtomasyonPage() {
  const [requests, setRequests] = useState<AutoReq[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/automation')
    const data = await res.json()
    setRequests(data.requests)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/automation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Otomasyon Talepleri</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{requests.length} toplam talep</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border/60">
                {['Şirket', 'Açıklama', 'Tip', 'Tarih', 'Durum', 'Güncelle'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 font-medium whitespace-nowrap">{r.customer.companyName}</td>
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.isExtra ? 'bg-rose-500/15 text-rose-500' : 'bg-muted text-muted-foreground'}`}>
                      {r.isExtra ? 'Ücretli' : 'Ücretsiz'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="text-xs px-3 h-7 rounded-xl border border-border bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">Otomasyon talebi yok.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
