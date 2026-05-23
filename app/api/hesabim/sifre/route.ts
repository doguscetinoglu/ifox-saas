import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current, next } = await request.json()
  if (!current || !next) return NextResponse.json({ error: 'Alanlar eksik' }, { status: 400 })
  if (next.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 400 })

  const hashed = await bcrypt.hash(next, 12)
  await prisma.user.update({ where: { id: session.userId }, data: { password: hashed } })

  return NextResponse.json({ success: true })
}
