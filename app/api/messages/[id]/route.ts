import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await verifyActiveSession()
  const { id } = await ctx.params

  const message = await prisma.message.findFirst({
    where: { id, customerId: session.customerId! },
    include: {
      replies: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { sentAt: 'asc' },
      },
    },
  })

  if (!message) return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 })
  return NextResponse.json({ message })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await verifyActiveSession()
  const { id } = await ctx.params
  const body = await req.json()

  const message = await prisma.message.findFirst({
    where: { id, customerId: session.customerId! },
  })
  if (!message) return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 })

  const updated = await prisma.message.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.isLead !== undefined ? { isLead: body.isLead } : {}),
    },
  })

  if (body.isLead && !message.isLead) {
    await prisma.lead.upsert({
      where: { messageId: id },
      update: {},
      create: {
        customerId: session.customerId!,
        messageId: id,
        name: message.senderName,
        contact: message.senderContact || undefined,
        createdBy: session.userId,
      },
    })
  }

  return NextResponse.json({ message: updated })
}
