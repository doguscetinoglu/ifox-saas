import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month'
  const now = new Date()

  let startDate: Date
  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'week') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const kayitlar = await prisma.ciroKayit.findMany({
    where: { userId: session.userId, tarih: { gte: startDate } },
    orderBy: { tarih: 'desc' },
  })

  return NextResponse.json(kayitlar)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { tarih, tutar, kategori, aciklama } = body

  if (!tarih || !tutar) return NextResponse.json({ error: 'Tarih ve tutar gerekli' }, { status: 400 })

  const kayit = await prisma.ciroKayit.create({
    data: {
      userId: session.userId,
      tarih: new Date(tarih),
      tutar: parseFloat(tutar),
      kategori: kategori || null,
      aciklama: aciklama || null,
    },
  })

  return NextResponse.json(kayit, { status: 201 })
}
