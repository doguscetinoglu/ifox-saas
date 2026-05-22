import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { id } = await params
  const { password } = await req.json()

  if (!password || password.length < 4) {
    return NextResponse.json({ error: 'Şifre en az 4 karakter olmalı' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id }, data: { password: hash } })

  return NextResponse.json({ ok: true })
}
