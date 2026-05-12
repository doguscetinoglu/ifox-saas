import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { validateWebhookSecret } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (!validateWebhookSecret(secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { externalId, senderName, senderContact, content, manychatPageId, platform = 'INSTAGRAM' } = body

  if (!externalId || !content || !manychatPageId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const socialAccount = await prisma.socialAccount.findFirst({
    where: { manychatPageId },
    include: { customer: { include: { user: true } } },
  })

  if (!socialAccount) {
    return NextResponse.json({ error: 'Social account not found' }, { status: 404 })
  }

  const customer = socialAccount.customer

  const message = await prisma.message.upsert({
    where: { externalId },
    update: { content },
    create: {
      customerId: customer.id,
      platform,
      externalId,
      senderName,
      senderContact,
      content,
    },
  })

  await createNotification({
    userId: customer.userId,
    type: 'NEW_MESSAGE',
    title: 'Yeni Mesaj',
    body: `${senderName}: ${content.slice(0, 80)}`,
  })

  return NextResponse.json({ messageId: message.id })
}
