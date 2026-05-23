import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const musteriler = await prisma.crmMusteri.findMany({
    where: { userId: session.userId },
    include: {
      _count: { select: { tickets: true, projeler: true } },
    },
    orderBy: { ad: 'asc' },
  })

  return NextResponse.json(musteriler)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ad, email, telefon, sirket, notlar } = await request.json()
  if (!ad) return NextResponse.json({ error: 'Ad gerekli' }, { status: 400 })

  const musteri = await prisma.crmMusteri.create({
    data: { userId: session.userId, ad, email: email || null, telefon: telefon || null, sirket: sirket || null, notlar: notlar || null },
  })
  return NextResponse.json(musteri, { status: 201 })
}
