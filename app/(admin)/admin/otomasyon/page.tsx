'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

type AutoReq = {
  id: string
  description: string
  isExtra: boolean
  status: string
  createdAt: string
  customer: { companyName: string }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  IN_PROGRESS: 'Devam Ediyor',
  DONE: 'Tamamlandı',
  REJECTED: 'Reddedildi',
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

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return <Badge className={colors[s] || ''}>{STATUS_LABELS[s] || s}</Badge>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Otomasyon Talepleri</h1>
      {loading ? (
        <p className="text-muted-foreground">Yükleniyor...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tüm Talepler ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3">Şirket</th>
                    <th className="text-left p-3">Açıklama</th>
                    <th className="text-left p-3">Tip</th>
                    <th className="text-left p-3">Tarih</th>
                    <th className="text-left p-3">Durum</th>
                    <th className="text-left p-3">Güncelle</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{r.customer.companyName}</td>
                      <td className="p-3 max-w-xs">
                        <p className="line-clamp-2">{r.description}</p>
                      </td>
                      <td className="p-3">
                        {r.isExtra ? (
                          <Badge variant="destructive">Ücretli</Badge>
                        ) : (
                          <Badge variant="secondary">Ücretsiz</Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                      <td className="p-3">{statusBadge(r.status)}</td>
                      <td className="p-3">
                        <Select
                          defaultValue={r.status}
                          onValueChange={(v) => v && updateStatus(r.id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                              <SelectItem key={v} value={v}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        Otomasyon talebi yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
