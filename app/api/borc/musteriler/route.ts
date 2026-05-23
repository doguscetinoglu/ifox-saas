import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const musteriler = await prisma.borcMusteri.findMany({
    where: { userId: session.userId },
    include: {
      borclar: { orderBy: { vadeTarihi: 'asc' } },
      odemeler: { orderBy: { odenmeTarihi: 'desc' } },
    },
    orderBy: { ad: 'asc' },
  })

  return NextResponse.json(musteriler)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { kod, ad, telefon, email, sehir } = await request.json()
  if (!kod || !ad) return NextResponse.json({ error: 'Kod ve ad gerekli' }, { status: 400 })

  try {
    const musteri = await prisma.borcMusteri.create({
      data: { userId: session.userId, kod, ad, telefon: telefon || null, email: email || null, sehir: sehir || null },
    })
    return NextResponse.json(musteri, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Müşteri kodu zaten mevcut' }, { status: 400 })
  }
}
