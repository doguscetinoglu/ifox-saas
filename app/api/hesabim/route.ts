import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, companyName, phone } = await request.json()

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: name || undefined,
      companyName: companyName ?? undefined,
      phone: phone ?? undefined,
    },
  })

  return NextResponse.json({ success: true, name: user.name })
}
