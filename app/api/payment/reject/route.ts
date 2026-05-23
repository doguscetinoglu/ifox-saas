import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'

export async function POST(req: Request) {
  await verifyAdminSession()

  const { paymentRequestId, notes } = await req.json()
  if (!paymentRequestId) return NextResponse.json({ error: 'paymentRequestId gerekli' }, { status: 400 })

  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
  })
  if (!paymentRequest) return NextResponse.json({ error: 'Ödeme talebi bulunamadı' }, { status: 404 })

  await prisma.paymentRequest.update({
    where: { id: paymentRequestId },
    data: { status: 'REJECTED', reviewedAt: new Date(), notes: notes ?? null },
  })

  await prisma.userSubscription.updateMany({
    where: {
      userId: paymentRequest.userId,
      productId: paymentRequest.productId,
      status: 'PENDING',
    },
    data: { status: 'CANCELLED' },
  })

  return NextResponse.json({ ok: true })
}
