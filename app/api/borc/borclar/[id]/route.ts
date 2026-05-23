import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const borc = await prisma.borc.findFirst({
    where: { id },
    include: { musteri: true },
  })
  if (!borc || borc.musteri.userId !== session.userId) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  const { durum, tutar, vadeTarihi, belgeTarihi, belgeNo, aciklama } = await request.json()

  const updated = await prisma.borc.update({
    where: { id },
    data: {
      durum: durum || borc.durum,
      tutar: tutar ? parseFloat(tutar) : borc.tutar,
      vadeTarihi: vadeTarihi ? new Date(vadeTarihi) : borc.vadeTarihi,
      belgeTarihi: belgeTarihi ? new Date(belgeTarihi) : borc.belgeTarihi,
      belgeNo: belgeNo ?? borc.belgeNo,
      aciklama: aciklama ?? borc.aciklama,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const borc = await prisma.borc.findFirst({ where: { id }, include: { musteri: true } })
  if (!borc || borc.musteri.userId !== session.userId) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  await prisma.borc.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
