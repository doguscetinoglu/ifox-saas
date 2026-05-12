import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  const { id } = await ctx.params
  const body = await req.json()

  if (session.role === 'ADMIN') {
    const updated = await prisma.automationRequest.update({
      where: { id },
      data: { status: body.status, extraPrice: body.extraPrice },
    })
    return NextResponse.json({ request: updated })
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
}
