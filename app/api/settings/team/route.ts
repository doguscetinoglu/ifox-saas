import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER' || !session.customerId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const employees = await prisma.user.findMany({
    where: { customerId: session.customerId, role: 'EMPLOYEE' },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  })

  return NextResponse.json({ employees })
}

export async function POST(req: Request) {
  const session = await verifyActiveSession()
  if (session.role !== 'OWNER' || !session.customerId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Ad, e-posta ve şifre gerekli' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Bu e-posta zaten kullanılıyor' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 12)
  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      customerId: session.customerId,
    },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  })

  return NextResponse.json({ employee })
}
