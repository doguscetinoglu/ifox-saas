import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const kayitlar = await prisma.ciroKayit.findMany({
    where: { userId: session.userId },
    orderBy: { tarih: 'asc' },
  })

  return NextResponse.json(kayitlar.map((k) => ({
    id: k.id,
    date: k.tarih.toISOString().slice(0, 10),
    ciro: k.tutar,
    sales: k.satisAdedi,
  })))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, ciro, sales } = await request.json()
  if (!date || ciro == null) return NextResponse.json({ error: 'date ve ciro gerekli' }, { status: 400 })

  const dayStart = new Date(date + 'T00:00:00.000Z')
  const dayEnd = new Date(date + 'T23:59:59.999Z')

  const existing = await prisma.ciroKayit.findFirst({
    where: { userId: session.userId, tarih: { gte: dayStart, lte: dayEnd } },
  })

  const data = { tutar: parseFloat(ciro), satisAdedi: parseInt(sales) || 0 }

  let kayit
  if (existing) {
    kayit = await prisma.ciroKayit.update({ where: { id: existing.id }, data })
  } else {
    kayit = await prisma.ciroKayit.create({
      data: { userId: session.userId, tarih: new Date(date + 'T12:00:00.000Z'), ...data },
    })
  }

  return NextResponse.json({
    id: kayit.id,
    date,
    ciro: kayit.tutar,
    sales: kayit.satisAdedi,
  }, { status: existing ? 200 : 201 })
}
