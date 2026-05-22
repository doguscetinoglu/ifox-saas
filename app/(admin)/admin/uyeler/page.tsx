import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import UyelerClient from './uyeler-client'

export default async function UyelerPage() {
  const customers = await prisma.customer.findMany({
    include: { user: true, package: true, _count: { select: { messages: true, leads: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return <UyelerClient customers={customers} />
}
