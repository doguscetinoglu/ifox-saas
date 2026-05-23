import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.crmTicket.findFirst({
    where: { id, userId: session.userId },
    include: {
      musteri: { select: { id: true, ad: true } },
      yanitlar: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!ticket) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  return NextResponse.json(ticket)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.crmTicket.findFirst({ where: { id, userId: session.userId } })
  if (!ticket) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  const { durum, oncelik, konu } = await request.json()

  const updated = await prisma.crmTicket.update({
    where: { id },
    data: { durum: durum ?? ticket.durum, oncelik: oncelik ?? ticket.oncelik, konu: konu ?? ticket.konu },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.crmTicket.findFirst({ where: { id, userId: session.userId } })
  if (!ticket) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  await prisma.crmTicket.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
