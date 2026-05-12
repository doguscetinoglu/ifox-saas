import { NextResponse } from 'next/server'
import { verifyActiveSession } from '@/lib/dal'

export async function GET() {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  return NextResponse.json({
    token: process.env.WEBHOOK_SECRET ?? '',
    path: '/api/webhooks/manychat-native',
  })
}
