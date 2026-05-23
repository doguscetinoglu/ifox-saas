import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import SirketClient from './sirket-client'

export default async function SirketOtomasyonuPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'sirket-otomasyonu' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const talepler = await prisma.automationRequest.findMany({
    where: { userId: session.userId, productId: 'sirket-otomasyonu' },
    orderBy: { createdAt: 'desc' },
  })

  return <SirketClient talepler={JSON.parse(JSON.stringify(talepler))} />
}
