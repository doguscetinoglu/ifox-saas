import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'

export async function POST(req: Request) {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  if (!session.customerId) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 400 })

  const { handle, manychatPageId } = await req.json()
  if (!handle?.trim()) return NextResponse.json({ error: 'Instagram kullanıcı adı zorunludur' }, { status: 400 })
  if (!manychatPageId?.trim()) return NextResponse.json({ error: 'ManyChat Page ID zorunludur' }, { status: 400 })

  const cleanHandle = handle.replace('@', '').trim()
  const cleanPageId = manychatPageId.trim()

  const existing = await prisma.socialAccount.findFirst({
    where: { customerId: session.customerId, handle: cleanHandle },
  })

  const account = existing
    ? await prisma.socialAccount.update({
        where: { id: existing.id },
        data: { manychatPageId: cleanPageId, status: 'CONNECTED' },
      })
    : await prisma.socialAccount.create({
        data: {
          customerId: session.customerId,
          handle: cleanHandle,
          platform: 'INSTAGRAM',
          manychatPageId: cleanPageId,
          status: 'CONNECTED',
        },
      })

  return NextResponse.json({ account })
}

export async function GET() {
  const session = await verifyActiveSession()
  if (!session.customerId) return NextResponse.json({ accounts: [] })

  const accounts = await prisma.socialAccount.findMany({
    where: { customerId: session.customerId },
  })
  return NextResponse.json({ accounts })
}
