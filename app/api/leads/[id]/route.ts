import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await verifyActiveSession()
  const { id } = await ctx.params
  const { notes } = await req.json()

  const lead = await prisma.lead.findFirst({ where: { id, customerId: session.customerId! } })
  if (!lead) return NextResponse.json({ error: 'Lead bulunamadı' }, { status: 404 })

  const updated = await prisma.lead.update({ where: { id }, data: { notes } })
  return NextResponse.json({ lead: updated })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  const { id } = await ctx.params

  const lead = await prisma.lead.findFirst({ where: { id, customerId: session.customerId! } })
  if (!lead) return NextResponse.json({ error: 'Lead bulunamadı' }, { status: 404 })

  await prisma.lead.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
