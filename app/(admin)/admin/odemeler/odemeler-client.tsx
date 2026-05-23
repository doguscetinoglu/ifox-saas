'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Payment = {
  id: string
  userName: string
  userEmail: string
  productName: string
  productIcon: string
  amount: number
  createdAt: string
  notifiedAt: string | null
}

export default function OdemelerClient({ payments }: { payments: Payment[] }) {
  const router = useRouter()
  const [dialog, setDialog] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAction() {
    if (!dialog) return
    setSubmitting(true)
    const endpoint = dialog.action === 'approve' ? '/api/payment/approve' : '/api/payment/reject'
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequestId: dialog.id, notes }),
    })
    setDialog(null)
    setNotes('')
    setSubmitting(false)
    router.refresh()
  }

  if (payments.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 text-center">
        <div className="text-4xl mb-4 opacity-30">✅</div>
        <p className="text-muted-foreground text-sm">Bekleyen ödeme yok.</p>
      </div>
    )
  }

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {['Kullanıcı', 'Ürün', 'Tutar', 'Bildirim', 'İşlem'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium">{p.userName}</p>
                  <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.productIcon}</span>
                    <span className="font-medium">{p.productName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-semibold">
                  ₺{p.amount.toLocaleString('tr-TR')}
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                  {p.notifiedAt
                    ? new Date(p.notifiedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : <span className="text-amber-500">Bildirilmedi</span>}
                </td>
                <td className="px-5 py-3.5">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              className="px-4 h-9 text-sm rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer">
              İptal
            </button>
            <button onClick={handleAction} disabled={submitting}
              className={`px-5 h-9 text-sm font-medium rounded-xl cursor-pointer disabled:opacity-40 transition-colors ${dialog?.action === 'approve' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {submitting ? 'İşleniyor...' : dialog?.action === 'approve' ? 'Onayla' : 'Reddet'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
