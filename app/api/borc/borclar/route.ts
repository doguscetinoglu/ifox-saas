import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { musteriId, belgeNo, tutar, vadeTarihi, belgeTarihi, aciklama } = await request.json()
  if (!musteriId || !tutar || !vadeTarihi || !belgeTarihi) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  const musteri = await prisma.borcMusteri.findFirst({ where: { id: musteriId, userId: session.userId } })
  if (!musteri) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })

  const borc = await prisma.borc.create({
    data: {
      musteriId,
      tutar: parseFloat(tutar),
      vadeTarihi: new Date(vadeTarihi),
      belgeTarihi: new Date(belgeTarihi),
      belgeNo: belgeNo || null,
      aciklama: aciklama || null,
    },
  })
  return NextResponse.json(borc, { status: 201 })
}
