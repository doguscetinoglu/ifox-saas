'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

type AutoReq = {
  id: string
  description: string
  isExtra: boolean
  status: string
  createdAt: string
}

const STATUS = { PENDING: 'Bekliyor', IN_PROGRESS: 'Devam Ediyor', DONE: 'Tamamlandı', REJECTED: 'Reddedildi' }
const FREE_LIMIT = 2

export default function OtomasyonTalebiPage() {
  const [requests, setRequests] = useState<AutoReq[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/automation')
    const data = await res.json()
    setRequests(data.requests || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function submit() {
    if (!description.trim()) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
    if (res.ok) {
      setDescription('')
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Hata oluştu')
    }
    setSubmitting(false)
  }

  const usedFree = requests.filter((r) => !r.isExtra).length
  const isExtraNext = usedFree >= FREE_LIMIT

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return <Badge className={colors[s]}>{STATUS[s as keyof typeof STATUS] || s}</Badge>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Otomasyon Talebi</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Kullanım</span>
            <span className="text-sm font-normal text-muted-foreground">
              {usedFree}/{FREE_LIMIT} ücretsiz talep
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min((usedFree / FREE_LIMIT) * 100, 100)}%` }}
            />
          </div>
          {isExtraNext && (
            <p className="text-sm text-amber-600 mt-2">
              Ücretsiz talep hakkınızı kullandınız. Bir sonraki talep ücretli olacak.
              Fiyat için sizinle iletişime geçeceğiz.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Yeni Talep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Otomasyon Açıklaması</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hangi otomasyonu istediğinizi detaylıca açıklayın..."
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isExtraNext && (
            <p className="text-xs text-muted-foreground">
              Bu talep <strong>ücretli</strong> olarak işlenecek. Fiyat için sizinle iletişime geçeceğiz.
            </p>
          )}
          <Button onClick={submit} disabled={submitting || !description.trim()}>
            {submitting ? 'Gönderiliyor...' : 'Talep Gönder'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Talep Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz talep yok.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusBadge(r.status)}
                      {r.isExtra && <Badge variant="outline" className="text-xs">Ücretli</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-sm">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
