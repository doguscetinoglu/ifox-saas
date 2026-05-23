import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import CrmClient from './crm-client'

export default async function FoxCrmPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'fox-crm' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const [musteriler, tickets, projeler] = await Promise.all([
    prisma.crmMusteri.findMany({
      where: { userId: session.userId },
      include: { _count: { select: { tickets: true, projeler: true } } },
      orderBy: { ad: 'asc' },
    }),
    prisma.crmTicket.findMany({
      where: { userId: session.userId },
      include: { musteri: { select: { id: true, ad: true } }, _count: { select: { yanitlar: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.crmProje.findMany({
      where: { userId: session.userId },
      include: { musteri: { select: { id: true, ad: true } }, adimlar: { include: { gorevler: true }, orderBy: { sira: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <CrmClient
      musteriler={JSON.parse(JSON.stringify(musteriler))}
      tickets={JSON.parse(JSON.stringify(tickets))}
      projeler={JSON.parse(JSON.stringify(projeler))}
    />
  )
}
