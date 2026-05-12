import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'
import { createNotification } from '@/lib/notifications'
import { sendRejectionEmail } from '@/lib/email'

export async function POST(req: Request) {
  await verifyAdminSession()

  const { paymentId, notes } = await req.json()
  if (!paymentId) return NextResponse.json({ error: 'paymentId gerekli' }, { status: 400 })

  const payment = await prisma.paymentRequest.findUnique({
    where: { id: paymentId },
    include: { customer: { include: { user: true } } },
  })
  if (!payment) return NextResponse.json({ error: 'Ödeme bulunamadı' }, { status: 404 })

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

  await prisma.paymentRequest.update({
    where: { id: paymentId },
    data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: admin?.id, notes },
  })

  await createNotification({
    userId: payment.customer.userId,
    type: 'PAYMENT_REJECTED',
    title: 'Ödeme Onaylanamadı',
    body: notes ? `Not: ${notes}` : 'Ödemeniz onaylanamadı. Destek için iletişime geçin.',
  })

  try {
    await sendRejectionEmail(payment.customer.user.email, payment.customer.user.name, notes)
  } catch {
    // non-critical
  }

  return NextResponse.json({ success: true })
}
