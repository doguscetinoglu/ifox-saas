import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'

export async function GET() {
  await verifyAdminSession()

  const payments = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: { include: { user: true } } },
  })

  return NextResponse.json({ payments })
}
