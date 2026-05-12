import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'
import { createNotification } from '@/lib/notifications'
import { sendApprovalEmail } from '@/lib/email'

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

  await prisma.$transaction([
    prisma.paymentRequest.update({
      where: { id: paymentId },
      data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: admin?.id, notes },
    }),
    prisma.user.update({
      where: { id: payment.customer.userId },
      data: { status: 'ACTIVE' },
    }),
    prisma.customer.update({
      where: { id: payment.customerId },
      data: { approvedAt: new Date(), approvedBy: admin?.id },
    }),
  ])

  await createNotification({
    userId: payment.customer.userId,
    type: 'ACCOUNT_APPROVED',
    title: 'Hesabınız Onaylandı',
    body: 'Ödemeniz onaylandı. Panele giriş yapabilirsiniz.',
  })

  try {
    await sendApprovalEmail(payment.customer.user.email, payment.customer.user.name)
  } catch {
    // non-critical
  }

  return NextResponse.json({ success: true })
}
