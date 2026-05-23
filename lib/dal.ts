import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/giris')
  return session
})

export const verifyActiveSession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/giris')
  if (session.status !== 'ACTIVE') redirect('/giris?suspended=1')
  return session
})

export const verifyAdminSession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/giris')
  if (session.role !== 'ADMIN') redirect('/giris')
  return session
})
