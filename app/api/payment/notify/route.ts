import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { notifyAdmin } from '@/lib/notifications'
import { sendPaymentNotificationToAdmin } from '@/lib/email'

export async function POST() {
  const session = await verifySession()

  const customer = await prisma.customer.findUnique({
    where: { userId: session.userId },
    include: { paymentRequests: { orderBy: { createdAt: 'desc' }, take: 1 }, user: true },
  })

  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })

  const paymentReq = customer.paymentRequests[0]
  if (!paymentReq) return NextResponse.json({ error: 'Ödeme kaydı bulunamadı' }, { status: 404 })
  if (paymentReq.status === 'APPROVED') {
    return NextResponse.json({ error: 'Ödeme zaten onaylı' }, { status: 400 })
  }
  if (paymentReq.notifiedAt) {
    return NextResponse.json({ message: 'Bildirim zaten gönderildi' })
  }

  await prisma.paymentRequest.update({
    where: { id: paymentReq.id },
    data: { notifiedAt: new Date() },
  })

  await notifyAdmin(
    'PAYMENT_CLAIMED',
    `Yeni Ödeme Bildirimi`,
    `${customer.companyName} ₺${paymentReq.amount} ödeme bildirimi gönderdi.`
  )

  try {
    await sendPaymentNotificationToAdmin(customer.companyName, paymentReq.amount)
  } catch {
    // email failure is non-critical
  }

  return NextResponse.json({ success: true })
}
