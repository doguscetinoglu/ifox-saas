import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function GET() {
  const session = await verifyActiveSession()
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const requests = await prisma.automationRequest.findMany({
    where: { customerId: session.customerId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ requests })
}

export async function POST(req: Request) {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const { description } = await req.json()
  if (!description?.trim()) return NextResponse.json({ error: 'Açıklama gerekli' }, { status: 400 })

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: { package: true },
  })
  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })

  const isExtra = customer.automationRequestCount >= customer.package.automationLimit
  const request = await prisma.automationRequest.create({
    data: {
      customerId: session.customerId,
      description,
      isExtra,
    },
  })

  await prisma.customer.update({
    where: { id: session.customerId },
    data: { automationRequestCount: { increment: 1 } },
  })

  return NextResponse.json({ request })
}
