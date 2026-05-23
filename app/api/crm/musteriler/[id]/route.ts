import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const musteri = await prisma.crmMusteri.findFirst({ where: { id, userId: session.userId } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  const { ad, email, telefon, sirket, notlar } = await request.json()

  const updated = await prisma.crmMusteri.update({
    where: { id },
    data: { ad: ad || musteri.ad, email: email ?? musteri.email, telefon: telefon ?? musteri.telefon, sirket: sirket ?? musteri.sirket, notlar: notlar ?? musteri.notlar },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const musteri = await prisma.crmMusteri.findFirst({ where: { id, userId: session.userId } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  await prisma.crmMusteri.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
