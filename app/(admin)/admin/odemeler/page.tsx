'use client'

import { useEffect, useState } from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Payment = {
  id: string
  amount: number
  status: string
  notifiedAt: string | null
  createdAt: string
  notes: string | null
  customer: { companyName: string; user: { name: string; email: string } }
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
    const endpoint = dialog.action === 'approve' ? '/api/payment/approve' : '/api/payment/reject'
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: dialog.id, notes }),
    })
    setDialog(null)
    setNotes('')
    setSubmitting(false)
    load()
  }

  const statusLabel = (s: string) => {
    if (s === 'PENDING') return <Badge variant="secondary">Bekliyor</Badge>
    if (s === 'APPROVED') return <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>
    return <Badge variant="destructive">Reddedildi</Badge>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ödeme Onayları</h1>
      {loading ? (
        <p className="text-muted-foreground">Yükleniyor...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Ödemeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3">Şirket</th>
                    <th className="text-left p-3">Kişi</th>
                    <th className="text-left p-3">Tutar</th>
                    <th className="text-left p-3">Bildirim Tarihi</th>
                    <th className="text-left p-3">Durum</th>
                    <th className="text-left p-3">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{p.customer.companyName}</td>
                      <td className="p-3">
                        <div>{p.customer.user.name}</div>
                        <div className="text-muted-foreground text-xs">{p.customer.user.email}</div>
                      </td>
                      <td className="p-3">{formatCurrency(p.amount)}</td>
                      <td className="p-3 text-muted-foreground">
                        {p.notifiedAt ? formatDate(p.notifiedAt) : '—'}
                      </td>
                      <td className="p-3">{statusLabel(p.status)}</td>
                      <td className="p-3">
                        {p.status === 'PENDING' && p.notifiedAt && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setDialog({ id: p.id, action: 'approve' })}
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDialog({ id: p.id, action: 'reject' })}
                            >
                              Reddet
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        Ödeme kaydı yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!dialog} onOpenChange={() => { setDialog(null); setNotes('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.action === 'approve' ? 'Ödemeyi Onayla' : 'Ödemeyi Reddet'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Not (opsiyonel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Müşteriye iletilecek not..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>İptal</Button>
            <Button
              onClick={handleAction}
              disabled={submitting}
              className={dialog?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={dialog?.action === 'reject' ? 'destructive' : 'default'}
            >
              {submitting ? 'İşleniyor...' : dialog?.action === 'approve' ? 'Onayla' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
