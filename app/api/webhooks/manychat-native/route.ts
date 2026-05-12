import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  // Token URL query param'dan gelir: ?token=SECRET
  const token = req.nextUrl.searchParams.get('token')
  if (!token || token !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { pageId, subscriberId, name, content } = body

  if (!pageId || !subscriberId || !content) {
    return NextResponse.json({ error: 'pageId, subscriberId ve content zorunludur' }, { status: 400 })
  }

  const socialAccount = await prisma.socialAccount.findFirst({
    where: { manychatPageId: pageId },
    include: { customer: true },
  })

  if (!socialAccount) {
    return NextResponse.json(
      { error: `pageId "${pageId}" kayıtlı değil. Ayarlar > Instagram bölümünde ManyChat Page ID girin.` },
      { status: 404 },
    )
  }

  // Her webhook tetiklemesi = yeni mesaj; timestamp ile benzersiz ID oluştur
  const externalId = `mc_${subscriberId}_${Date.now()}`

  const message = await prisma.message.create({
    data: {
      customerId: socialAccount.customerId,
      platform: 'INSTAGRAM',
      externalId,
      senderName: name?.trim() || 'Instagram Kullanıcısı',
      senderContact: subscriberId,
      content,
    },
  })

  await createNotification({
    userId: socialAccount.customer.userId,
    type: 'NEW_MESSAGE',
    title: 'Yeni Mesaj',
    body: `${name || 'Biri'}: ${content.slice(0, 80)}`,
  })

  return NextResponse.json({ ok: true, messageId: message.id })
}
