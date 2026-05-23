import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { redirect } from 'next/navigation'
import OdemeClient from './odeme-client'

export default async function OdemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await verifyActiveSession()

  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) redirect('/panel')

  const existing = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: product.id } },
  })

  if (existing?.status === 'ACTIVE') redirect('/panel')

  return (
    <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <span className="text-2xl">{product.icon}</span>
        </div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aşağıdaki IBAN&apos;a <strong className="text-foreground">₺1.000</strong> transfer yapın
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {[
          { label: 'Ürün', value: product.name },
          { label: 'Banka', value: process.env.NEXT_PUBLIC_IBAN_BANK || 'Banka Adı' },
          { label: 'Hesap Sahibi', value: process.env.NEXT_PUBLIC_IBAN_HOLDER || 'Ad Soyad' },
          { label: 'Tutar', value: '₺1.000' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl glass-subtle">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className="text-sm font-semibold">{value}</span>
          </div>
        ))}
        <div className="px-4 py-3 rounded-xl glass-subtle">
          <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">IBAN</span>
          <span className="text-sm font-mono font-semibold break-all">
            {process.env.NEXT_PUBLIC_IBAN_NUMBER || 'TR00 0000 0000 0000 0000 0000 00'}
          </span>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 mb-6 text-xs leading-relaxed"
        style={{ background: 'rgba(250, 130, 49, 0.12)', color: '#fa8231' }}>
        Transfer açıklamasına <strong>iFox - {product.name}</strong> yazmayı unutmayın. Ödeme sonrası aşağıdaki butona tıklayın.
      </div>

      {existing?.status === 'PENDING' ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Ödeme bildiriminiz inceleniyor
          </div>
          <p className="text-xs text-muted-foreground text-center">Onaylandığında bu ürüne erişebileceksiniz.</p>
        </div>
      ) : (
        <OdemeClient productId={product.id} />
      )}
    </div>
  )
}
