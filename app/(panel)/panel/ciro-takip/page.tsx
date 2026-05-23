import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import CiroClient from './ciro-client'

type Entry = { id: string; date: string; ciro: number; sales: number }
type GoalMap = Record<string, { ciroGoal: number; salesGoal: number }>

export default async function CiroTakipPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'ciro-takip' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const [kayitlar, hedefler] = await Promise.all([
    prisma.ciroKayit.findMany({
      where: { userId: session.userId },
      orderBy: { tarih: 'asc' },
    }),
    prisma.ciroHedef.findMany({ where: { userId: session.userId } }),
  ])

  const entries: Entry[] = kayitlar.map((k) => ({
    id: k.id,
    date: k.tarih.toISOString().slice(0, 10),
    ciro: k.tutar,
    sales: k.satisAdedi,
  }))

  const goals: GoalMap = {}
  for (const h of hedefler) {
    goals[h.ayKey] = { ciroGoal: h.ciroHedef, salesGoal: h.satisHedef }
  }

  return <CiroClient entries={entries} goals={goals} />
}
