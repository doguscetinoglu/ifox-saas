import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'

export async function POST(req: Request) {
  await verifyAdminSession()

  const { paymentRequestId } = await req.json()
  if (!paymentRequestId) return NextResponse.json({ error: 'paymentRequestId gerekli' }, { status: 400 })

  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
    include: { user: true, product: true },
  })
  if (!paymentRequest) return NextResponse.json({ error: 'Ödeme talebi bulunamadı' }, { status: 404 })

  await prisma.$transaction([
    prisma.paymentRequest.update({
      where: { id: paymentRequestId },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    }),
    prisma.userSubscription.upsert({
      where: {
        userId_productId: {
          userId: paymentRequest.userId,
          productId: paymentRequest.productId,
        },
      },
      create: {
        userId: paymentRequest.userId,
        productId: paymentRequest.productId,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      update: { status: 'ACTIVE', startedAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
