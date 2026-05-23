import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import HesabimClient from './hesabim-client'

export default async function HesabimPage() {
  const session = await verifyActiveSession()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, companyName: true, phone: true },
  })

  return <HesabimClient user={user!} />
}
