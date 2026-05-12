import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function GET(req: NextRequest) {
  const session = await verifyActiveSession()
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const where = {
    customerId: session.customerId,
    ...(status ? { status: status as 'NEW' | 'REPLIED' | 'CLOSED' } : {}),
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        replies: { include: { user: { select: { name: true } } }, orderBy: { sentAt: 'asc' } },
      },
    }),
    prisma.message.count({ where }),
  ])

  return NextResponse.json({ messages, total, page, totalPages: Math.ceil(total / limit) })
}
