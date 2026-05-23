import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await prisma.crmTicket.findMany({
    where: { userId: session.userId },
    include: {
      musteri: { select: { id: true, ad: true } },
      _count: { select: { yanitlar: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tickets)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { musteriId, konu, icerik, oncelik } = await request.json()
  if (!konu || !icerik) return NextResponse.json({ error: 'Konu ve içerik gerekli' }, { status: 400 })

  const ticket = await prisma.crmTicket.create({
    data: {
      userId: session.userId,
      musteriId: musteriId || null,
      konu,
      icerik,
      oncelik: oncelik || 'Normal',
    },
  })
  return NextResponse.json(ticket, { status: 201 })
}
