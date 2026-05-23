import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.crmTicket.findFirst({ where: { id, userId: session.userId } })
  if (!ticket) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  const { icerik, dahili } = await request.json()
  if (!icerik) return NextResponse.json({ error: 'İçerik gerekli' }, { status: 400 })

  const yanit = await prisma.crmYanit.create({
    data: { ticketId: id, userId: session.userId, icerik, dahili: dahili ?? false },
  })
  return NextResponse.json(yanit, { status: 201 })
}
