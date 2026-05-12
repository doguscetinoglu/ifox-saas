'use client'

import { useEffect, useState } from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Payment = {
  id: string; amount: number; status: string; notifiedAt: string | null; createdAt: string; notes: string | null
  customer: { companyName: string; user: { name: string; email: string } }
}

const STATUS = {
  PENDING: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">Bekliyor</span>,
  APPROVED: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">Onaylandı</span>,
  REJECTED: <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">Reddedildi</span>,
}

export default function OdemelerPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/payments')
    const data = await res.json()
    setPayments(data.payments)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleAction() {
    if (!dialog) return
    setSubmitting(true)
    await fetch(dialog.action === 'approve' ? '/api/payment/approve' : '/api/payment/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: dialog.id, notes }),
    })
    setDialog(null); setNotes(''); setSubmitting(false); load()
  }

  const pending = payments.filter((p) => p.status === 'PENDING' && p.notifiedAt)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ödeme Onayları</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          <span className="text-amber-500 font-medium">{pending.length}</span> onay bekliyor
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {['Şirket', 'Kişi', 'Tutar', 'Bildirim', 'Durum', 'İşlem'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{p.customer.companyName}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{p.customer.user.name}</p>
                    <p className="text-xs text-muted-foreground">{p.customer.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{p.notifiedAt ? formatDate(p.notifiedAt) : '—'}</td>
                  <td className="px-5 py-3.5">{STATUS[p.status as keyof typeof STATUS]}</td>
                  <td className="px-5 py-3.5">
                    {p.status === 'PENDING' && p.notifiedAt && (
                      <div className="flex gap-2">
                        <button onClick={() => setDialog({ id: p.id, action: 'approve' })}
                          className="text-xs font-medium px-3 h-7 rounded-full bg-green-500/15 text-green-500 hover:bg-green-500/25 transition-colors cursor-pointer">
                          Onayla
                        </button>
                        <button onClick={() => setDialog({ id: p.id, action: 'reject' })}
                          className="text-xs font-medium px-3 h-7 rounded-full bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors cursor-pointer">
                          Reddet
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">Ödeme kaydı yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={() => { setDialog(null); setNotes('') }}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>{dialog?.action === 'approve' ? '✅ Ödemeyi Onayla' : '❌ Ödemeyi Reddet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-muted-foreground">Not (opsiyonel)</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Müşteriye iletilecek not..."
              rows={3}
              className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-black/3 dark:bg-white/4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <DialogFooter>
            <button onClick={() => setDialog(null)}
              className="px-4 h-9 text-sm rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer">İptal</button>
            <button onClick={handleAction} disabled={submitting}
              className={`px-5 h-9 text-sm font-medium rounded-xl cursor-pointer disabled:opacity-40 transition-colors ${dialog?.action === 'approve' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {submitting ? 'İşleniyor...' : dialog?.action === 'approve' ? 'Onayla' : 'Reddet'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
