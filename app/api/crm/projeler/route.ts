import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projeler = await prisma.crmProje.findMany({
    where: { userId: session.userId },
    include: {
      musteri: { select: { id: true, ad: true } },
      adimlar: { include: { gorevler: true }, orderBy: { sira: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projeler)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { musteriId, ad, aciklama } = await request.json()
  if (!ad) return NextResponse.json({ error: 'Proje adı gerekli' }, { status: 400 })

  const proje = await prisma.crmProje.create({
    data: { userId: session.userId, musteriId: musteriId || null, ad, aciklama: aciklama || null },
  })
  return NextResponse.json(proje, { status: 201 })
}
