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
  const { event } = body

  if (event === 'INSTAGRAM_CONNECTED') {
    const { customerId, manychatPageId, handle } = body
    await prisma.socialAccount.updateMany({
      where: { customerId, handle },
      data: { status: 'CONNECTED', manychatPageId },
    })
    await createNotification({
      userId: (await prisma.customer.findUnique({ where: { id: customerId } }))!.userId,
      type: 'INSTAGRAM_CONNECTED',
      title: 'Instagram Bağlandı',
      body: `@${handle} hesabınız başarıyla bağlandı.`,
    })
    return NextResponse.json({ ok: true })
  }

  if (event === 'REPLY_SENT') {
    const { messageReplyId, manychatMessageId } = body
    await prisma.messageReply.update({
      where: { id: messageReplyId },
      data: { sentViaManychat: true, manychatMessageId },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
}
