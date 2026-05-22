import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const POLL_INTERVAL = 2500  // ms
const MAX_DURATION = 50_000 // 50s — Vercel safe, client reconnects automatically

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ifox_session')?.value
  const session = await decrypt(token)

  if (!session?.userId || session.status !== 'ACTIVE') {
    return new Response('Unauthorized', { status: 401 })
  }

  // EMPLOYEE rolü sadece kendi müşterisini görebilir
  const customerId = session.customerId
  if (!customerId) {
    return new Response('No customer', { status: 400 })
  }

  // Son bilinen mesaj zamanını al (yeniden bağlantıda kullanılır)
  const sinceParam = req.nextUrl.searchParams.get('since')
  let lastCheck = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 5000)

  const encoder = new TextEncoder()
  const startTime = Date.now()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          closed = true
        }
      }

      // Bağlantı kuruldu sinyali
      send('connected')

      while (!closed && Date.now() - startTime < MAX_DURATION) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL))
        if (closed) break

        try {
          const count = await prisma.message.count({
            where: { customerId, receivedAt: { gt: lastCheck } },
          })

          if (count > 0) {
            lastCheck = new Date()
            send('refresh')
          } else {
            // Bağlantıyı canlı tut
            send('ping')
          }
        } catch {
          break
        }
      }

      try { controller.close() } catch { /* already closed */ }
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
