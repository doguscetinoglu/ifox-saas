import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import CiroClient from './ciro-client'

export default async function CiroTakipPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'ciro-takip' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 6)
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [kayitlar, hedef] = await Promise.all([
    prisma.ciroKayit.findMany({
      where: { userId: session.userId, tarih: { gte: startOfMonth } },
      orderBy: { tarih: 'desc' },
    }),
    prisma.ciroHedef.findUnique({ where: { userId: session.userId } }),
  ])

  const bugün = kayitlar.filter((k) => k.tarih >= startOfToday).reduce((s, k) => s + k.tutar, 0)
  const hafta = kayitlar.filter((k) => k.tarih >= startOfWeek).reduce((s, k) => s + k.tutar, 0)
  const ay = kayitlar.reduce((s, k) => s + k.tutar, 0)

  return (
    <CiroClient
      kayitlar={kayitlar.map((k) => ({ ...k, tarih: k.tarih.toISOString() }))}
      hedef={hedef}
      bugün={bugün}
      hafta={hafta}
      ay={ay}
    />
  )
}
