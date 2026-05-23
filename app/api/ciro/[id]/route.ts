import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const kayit = await prisma.ciroKayit.findFirst({ where: { id, userId: session.userId } })
  if (!kayit) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  await prisma.ciroKayit.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
