import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await request.json()

  const talep = await prisma.automationRequest.create({
    data: {
      userId: session.userId,
      productId: 'sirket-otomasyonu',
      description: description || null,
    },
  })

  return NextResponse.json(talep, { status: 201 })
}
