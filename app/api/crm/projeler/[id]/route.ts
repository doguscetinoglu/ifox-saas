import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const proje = await prisma.crmProje.findFirst({ where: { id, userId: session.userId } })
  if (!proje) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  const { ad, aciklama, durum } = await request.json()

  const updated = await prisma.crmProje.update({
    where: { id },
    data: { ad: ad ?? proje.ad, aciklama: aciklama ?? proje.aciklama, durum: durum ?? proje.durum },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const proje = await prisma.crmProje.findFirst({ where: { id, userId: session.userId } })
  if (!proje) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  await prisma.crmProje.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
