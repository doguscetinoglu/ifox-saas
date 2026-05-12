import { prisma } from '@/lib/prisma'

export async function createNotification({
  userId,
  type,
  title,
  body,
}: {
  userId: string
  type: string
  title: string
  body: string
}) {
  return prisma.notification.create({
    data: { userId, type, title, body },
  })
}

export async function notifyAdmin(type: string, title: string, body: string) {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) return
  return createNotification({ userId: admin.id, type, title, body })
}
