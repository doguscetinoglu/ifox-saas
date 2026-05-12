import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import type { Role } from '@/app/generated/prisma/client'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/giris')
  }
  return session
})

export const verifyActiveSession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/giris')
  if (session.status !== 'ACTIVE') redirect('/odeme')
  return session
})

export const verifyAdminSession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/giris')
  if (session.role !== 'ADMIN') redirect('/giris')
  return session
})

export function requireRole(session: { role: Role }, roles: Role[]) {
  if (!roles.includes(session.role)) {
    return false
  }
  return true
}
