import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { triggerSendReply } from '@/lib/n8n'

export async function POST(req: Request) {
  const session = await verifyActiveSession()
  const { messageId, content } = await req.json()

  if (!messageId || !content?.trim()) {
    return NextResponse.json({ error: 'messageId ve content gerekli' }, { status: 400 })
  }

  const message = await prisma.message.findFirst({
    where: { id: messageId, customerId: session.customerId! },
  })
  if (!message) return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 })

  const reply = await prisma.messageReply.create({
    data: {
      messageId,
      userId: session.userId,
      content,
    },
  })

  await prisma.message.update({
    where: { id: messageId },
    data: { status: 'REPLIED' },
  })

  // Async N8N call — don't block response
  triggerSendReply({
    subscriberId: message.externalId,
    content,
    messageReplyId: reply.id,
  }).catch(() => {})

  return NextResponse.json({ reply })
}
