import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await verifyActiveSession()
  if (!session.customerId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      package: true,
      paymentRequests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const approvedPayments = customer.paymentRequests.filter((p) => p.status === 'APPROVED')
  const totalPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0)

  return NextResponse.json({
    companyName: customer.companyName,
    approvedAt: customer.approvedAt,
    package: customer.package,
    automationRequestCount: customer.automationRequestCount,
    totalPaid,
    payments: customer.paymentRequests,
  })
}
