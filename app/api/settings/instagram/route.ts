import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { triggerInstagramConnect } from '@/lib/n8n'

export async function POST(req: Request) {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  if (!session.customerId) return NextResponse.json({ error: 'No customer' }, { status: 400 })

  const { handle } = await req.json()
  if (!handle?.trim()) return NextResponse.json({ error: 'Instagram kullanıcı adı gerekli' }, { status: 400 })

  const cleanHandle = handle.replace('@', '').trim()

  const account = await prisma.socialAccount.upsert({
    where: { id: (await prisma.socialAccount.findFirst({ where: { customerId: session.customerId, handle: cleanHandle } }))?.id || '' },
    update: { status: 'PENDING' },
    create: {
      customerId: session.customerId,
      handle: cleanHandle,
      platform: 'INSTAGRAM',
      status: 'PENDING',
    },
  })

  triggerInstagramConnect({
    customerId: session.customerId,
    handle: cleanHandle,
    socialAccountId: account.id,
  }).catch(() => {})

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
