import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hedefler = await prisma.ciroHedef.findMany({ where: { userId: session.userId } })

  const goals: Record<string, { ciroGoal: number; salesGoal: number }> = {}
  for (const h of hedefler) {
    goals[h.ayKey] = { ciroGoal: h.ciroHedef, salesGoal: h.satisHedef }
  }

  return NextResponse.json(goals)
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { monthKey, ciroGoal, salesGoal } = await request.json()
  if (!monthKey) return NextResponse.json({ error: 'monthKey gerekli' }, { status: 400 })

  await prisma.ciroHedef.upsert({
    where: { userId_ayKey: { userId: session.userId, ayKey: monthKey } },
    update: { ciroHedef: parseFloat(ciroGoal) || 0, satisHedef: parseInt(salesGoal) || 0 },
    create: { userId: session.userId, ayKey: monthKey, ciroHedef: parseFloat(ciroGoal) || 0, satisHedef: parseInt(salesGoal) || 0 },
  })

  return NextResponse.json({ success: true })
}
