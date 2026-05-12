import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER' || !session.customerId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { id } = await ctx.params
  const employee = await prisma.user.findFirst({
    where: { id, customerId: session.customerId, role: 'EMPLOYEE' },
  })
  if (!employee) return NextResponse.json({ error: 'Çalışan bulunamadı' }, { status: 404 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
