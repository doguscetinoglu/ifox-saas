import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function GET() {
  const session = await verifyActiveSession()
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const leads = await prisma.lead.findMany({
    where: { customerId: session.customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { name: true } },
      message: { select: { content: true, receivedAt: true } },
    },
  })

  return NextResponse.json({ leads })
}

export async function POST(req: Request) {
  const session = await verifyActiveSession()
  const { messageId, name, contact, notes } = await req.json()
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const lead = await prisma.lead.create({
    data: {
      customerId: session.customerId,
      messageId,
      name,
      contact,
      notes,
      createdBy: session.userId,
    },
  })

  if (messageId) {
    await prisma.message.update({ where: { id: messageId }, data: { isLead: true } })
  }

  return NextResponse.json({ lead })
}
