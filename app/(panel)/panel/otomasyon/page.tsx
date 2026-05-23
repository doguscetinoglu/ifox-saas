import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import OtomasyonClient from './otomasyon-client'

export default async function OtomasyonPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'otomasyon' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const talepler = await prisma.automationRequest.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  return <OtomasyonClient talepler={JSON.parse(JSON.stringify(talepler))} />
}
