import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function POST(req: Request) {
  const session = await verifySession()
  const { ids } = await req.json()
  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: session.userId },
    data: { isRead: true },
  })
  return NextResponse.json({ success: true })
}
