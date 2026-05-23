import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const musteri = await prisma.borcMusteri.findFirst({ where: { id, userId: session.userId } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  const { ad, telefon, email, sehir } = await request.json()

  const updated = await prisma.borcMusteri.update({
    where: { id },
    data: { ad: ad || musteri.ad, telefon: telefon ?? musteri.telefon, email: email ?? musteri.email, sehir: sehir ?? musteri.sehir },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const musteri = await prisma.borcMusteri.findFirst({ where: { id, userId: session.userId } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  await prisma.borcMusteri.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
