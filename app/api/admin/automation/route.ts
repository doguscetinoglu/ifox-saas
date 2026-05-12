import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'

export async function GET() {
  await verifyAdminSession()
  const requests = await prisma.automationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  })
  return NextResponse.json({ requests })
}
