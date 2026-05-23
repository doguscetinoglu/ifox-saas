import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function POST(req: Request) {
  const session = await verifyActiveSession()

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId gerekli' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })

  const existing = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  })

  if (existing?.status === 'ACTIVE') {
    return NextResponse.json({ error: 'Bu ürüne zaten abonesiniz' }, { status: 400 })
  }
  if (existing?.status === 'PENDING') {
    return NextResponse.json({ error: 'Ödeme bildirimi zaten gönderildi, onay bekleniyor' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.paymentRequest.create({
      data: {
        userId: session.userId,
        productId,
        amount: product.price,
        status: 'PENDING',
        notifiedAt: new Date(),
      },
    }),
    prisma.userSubscription.upsert({
      where: { userId_productId: { userId: session.userId, productId } },
      create: { userId: session.userId, productId, status: 'PENDING' },
      update: { status: 'PENDING' },
    }),
  ])

  return NextResponse.json({ ok: true })
}
