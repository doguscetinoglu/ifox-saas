'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Ad en az 2 karakter olmalı.' }).trim(),
  email: z.email({ message: 'Geçerli bir e-posta girin.' }).trim(),
  companyName: z.string().min(2, { message: 'Şirket adı en az 2 karakter olmalı.' }).trim(),
  password: z.string().min(8, { message: 'Şifre en az 8 karakter olmalı.' }),
})

const LoginSchema = z.object({
  email: z.email({ message: 'Geçerli bir e-posta girin.' }).trim(),
  password: z.string().min(1, { message: 'Şifre girin.' }),
})

export type FormState = {
  errors?: Record<string, string[]>
  message?: string
} | undefined

export async function register(state: FormState, formData: FormData): Promise<FormState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    companyName: formData.get('companyName'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, companyName, password } = validated.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ['Bu e-posta adresi zaten kayıtlı.'] } }
  }

  const pkg = await prisma.package.findFirst()
  if (!pkg) return { message: 'Paket bulunamadı. Lütfen yönetici ile iletişime geçin.' }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      companyName,
      password: hashedPassword,
      role: 'OWNER',
      status: 'PENDING',
      ownedCustomer: {
        create: {
          companyName,
          packageId: pkg.id,
          paymentRequests: {
            create: { amount: pkg.price },
          },
        },
      },
    },
    include: { ownedCustomer: true },
  })

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    customerId: user.ownedCustomer?.id ?? null,
  })

  redirect('/odeme')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  const user = await prisma.user.findUnique({
    where: { email },
    include: { ownedCustomer: true },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { errors: { email: ['E-posta veya şifre hatalı.'] } }
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    customerId: user.ownedCustomer?.id ?? user.customerId ?? null,
  })

  if (user.role === 'ADMIN') redirect('/admin')
  if (user.status === 'PENDING') redirect('/odeme')
  if (user.role === 'EMPLOYEE') redirect('/panel/mesajlar')
  redirect('/panel')
}

export async function logout() {
  await deleteSession()
  redirect('/giris')
}
