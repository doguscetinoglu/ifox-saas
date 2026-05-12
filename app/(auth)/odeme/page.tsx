'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function OdemePage() {
  const [notified, setNotified] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleNotify() {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/notify', { method: 'POST' })
      if (res.ok) setNotified(true)
    } finally {
      setLoading(false)
    }
  }

  if (notified) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-semibold">Ödeme Bildirimi Alındı</h2>
          <p className="text-muted-foreground">
            Ödemeniz inceleniyor. Onaylandığında e-posta alacaksınız.
            Ortalama onay süresi 1-4 saattir.
          </p>
          <Badge variant="secondary">Bekleniyor</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ödeme Bilgileri</CardTitle>
        <CardDescription>
          Aşağıdaki IBAN&apos;a aylık ücret olan <strong>₺2.000</strong> tutarı gönderin,
          ardından &quot;Ödemeyi Bildirdim&quot; butonuna tıklayın.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted rounded-lg p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Banka</span>
            <span className="font-medium">{process.env.NEXT_PUBLIC_IBAN_BANK || 'Banka Adı'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Hesap Sahibi</span>
            <span className="font-medium">{process.env.NEXT_PUBLIC_IBAN_HOLDER || 'Ad Soyad'}</span>
          </div>
          <Separator />
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm">IBAN</span>
            <p className="font-mono font-semibold text-sm break-all">
              {process.env.NEXT_PUBLIC_IBAN_NUMBER || 'TR00 0000 0000 0000 0000 0000 00'}
            </p>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Tutar</span>
            <span className="font-bold text-lg text-primary">₺2.000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Açıklama (opsiyonel)</span>
            <span className="font-medium text-sm">iFox Social</span>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Ödeme yaptıktan sonra aşağıdaki butona tıklayın. Ödemeniz en geç 4 saat içinde onaylanır.
        </div>
        <Button
          onClick={handleNotify}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Bildiriliyor...' : 'Ödemeyi Bildirdim'}
        </Button>
      </CardContent>
    </Card>
  )
}
