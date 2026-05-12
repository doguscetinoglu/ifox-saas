import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { startOfDay, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, format } from 'date-fns'

function getPeriodRange(period: string, date: Date): { start: Date; end: Date } {
  const end = new Date()
  if (period === 'daily') return { start: startOfDay(date), end }
  if (period === 'weekly') return { start: startOfWeek(date, { weekStartsOn: 1 }), end }
  if (period === 'monthly') return { start: startOfMonth(date), end }
  return { start: startOfYear(date), end }
}

export async function GET(req: NextRequest) {
  const session = await verifyActiveSession()
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const period = req.nextUrl.searchParams.get('period') || 'weekly'
  const dateParam = req.nextUrl.searchParams.get('date')
  const date = dateParam ? new Date(dateParam) : new Date()

  const { start, end } = getPeriodRange(period, date)
  const cId = session.customerId

  const [messages, leads, replies] = await Promise.all([
    prisma.message.findMany({
      where: { customerId: cId, receivedAt: { gte: start, lte: end } },
      select: { receivedAt: true, isLead: true },
    }),
    prisma.lead.findMany({
      where: { customerId: cId, createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    }),
    prisma.messageReply.findMany({
      where: { message: { customerId: cId }, sentAt: { gte: start, lte: end } },
      select: { sentAt: true, userId: true, user: { select: { name: true } } },
    }),
  ])

  const days = period === 'yearly'
    ? Array.from({ length: 12 }, (_, i) => new Date(date.getFullYear(), i, 1))
    : eachDayOfInterval({ start, end })

  const msgByDay = days.map((d) => {
    const key = period === 'yearly' ? format(d, 'yyyy-MM') : format(d, 'yyyy-MM-dd')
    const count = messages.filter((m) => {
      const mKey = period === 'yearly'
        ? format(new Date(m.receivedAt), 'yyyy-MM')
        : format(new Date(m.receivedAt), 'yyyy-MM-dd')
      return mKey === key
    }).length
    return {
      date: period === 'yearly' ? format(d, 'MMM') : format(d, 'dd.MM'),
      messages: count,
    }
  })

  const leadsByDay = days.map((d) => {
    const key = period === 'yearly' ? format(d, 'yyyy-MM') : format(d, 'yyyy-MM-dd')
    const count = leads.filter((l) => {
      const lKey = period === 'yearly'
        ? format(new Date(l.createdAt), 'yyyy-MM')
        : format(new Date(l.createdAt), 'yyyy-MM-dd')
      return lKey === key
    }).length
    return { date: period === 'yearly' ? format(d, 'MMM') : format(d, 'dd.MM'), leads: count }
  })

  const employeePerf = Object.values(
    replies.reduce((acc, r) => {
      const name = r.user.name
      if (!acc[name]) acc[name] = { name, replies: 0 }
      acc[name].replies++
      return acc
    }, {} as Record<string, { name: string; replies: number }>)
  )

  return NextResponse.json({
    msgByDay,
    leadsByDay,
    employeePerf,
    totals: {
      messages: messages.length,
      leads: leads.length,
      replies: replies.length,
      conversionRate: messages.length > 0 ? Math.round((leads.length / messages.length) * 100) : 0,
    },
  })
}
