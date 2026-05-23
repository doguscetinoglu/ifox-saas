import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import BorcClient from './borc-client'

export default async function BorcTakipPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'borc-takip' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const musteriler = await prisma.borcMusteri.findMany({
    where: { userId: session.userId },
    include: {
      borclar: { orderBy: { vadeTarihi: 'asc' } },
      odemeler: { orderBy: { odenmeTarihi: 'desc' } },
    },
    orderBy: { ad: 'asc' },
  })

  return <BorcClient musteriler={JSON.parse(JSON.stringify(musteriler))} />
}
