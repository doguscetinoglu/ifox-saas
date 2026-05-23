import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hedef = await prisma.ciroHedef.findUnique({ where: { userId: session.userId } })
  return NextResponse.json(hedef)
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { aylik, haftalik, gunluk } = await request.json()

  const hedef = await prisma.ciroHedef.upsert({
    where: { userId: session.userId },
    update: { aylik: parseFloat(aylik) || 0, haftalik: parseFloat(haftalik) || 0, gunluk: parseFloat(gunluk) || 0 },
    create: { userId: session.userId, aylik: parseFloat(aylik) || 0, haftalik: parseFloat(haftalik) || 0, gunluk: parseFloat(gunluk) || 0 },
  })

  return NextResponse.json(hedef)
}
