import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Güvenlik: kullanıcı bulunsun ya da bulunmasın aynı cevabı dön
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 saat

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const appUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
    const resetUrl = `${appUrl}/sifre-sifirla?token=${token}`

    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) => {
      console.error('[forgot-password] email error:', err)
      return null
    })
    if (emailResult && 'error' in emailResult && emailResult.error) {
      console.error('[forgot-password] resend error:', JSON.stringify(emailResult.error))
    }
  }

  return NextResponse.json({ ok: true })
}
