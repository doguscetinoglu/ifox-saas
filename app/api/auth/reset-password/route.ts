import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken) {
    return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı' }, { status: 400 })
  }

  if (resetToken.usedAt) {
    return NextResponse.json({ error: 'Bu bağlantı daha önce kullanıldı' }, { status: 400 })
  }

  if (new Date() > resetToken.expiresAt) {
    return NextResponse.json({ error: 'Bağlantının süresi dolmuş, yeni talep oluşturun' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { password: hash } }),
    prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ])

  return NextResponse.json({ ok: true })
}
