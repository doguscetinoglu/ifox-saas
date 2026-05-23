import { prisma } from '@/lib/prisma'
import UyelerClient from './uyeler-client'

export default async function UyelerPage() {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      subscriptions: { include: { product: true }, orderBy: { createdAt: 'desc' } },
      paymentRequests: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <UyelerClient users={users} />
}
