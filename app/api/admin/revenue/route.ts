import { verifyAdminSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  await verifyAdminSession()

  const payments = await prisma.paymentRequest.findMany({
    where: { status: 'APPROVED' },
    include: { customer: { select: { companyName: true } } },
    orderBy: { reviewedAt: 'desc' },
  })

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const customerCount = new Set(payments.map((p) => p.customerId)).size

  // Group by month (YYYY-MM)
  const byMonth: Record<string, number> = {}
  for (const p of payments) {
    const date = p.reviewedAt ?? p.createdAt
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] ?? 0) + p.amount
  }

  const monthly = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))

  return NextResponse.json({ totalRevenue, customerCount, monthly, payments })
}
