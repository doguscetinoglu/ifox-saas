import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'
import OdemelerClient from './odemeler-client'

export default async function OdemelerPage() {
  await verifyAdminSession()

  const payments = await prisma.paymentRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  })

  const data = payments.map((p) => ({
    id: p.id,
    userName: p.user.name,
    userEmail: p.user.email,
    productName: p.product.name,
    productIcon: p.product.icon,
    amount: p.amount,
    createdAt: p.createdAt.toISOString(),
    notifiedAt: p.notifiedAt?.toISOString() ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bekleyen Ödemeler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          <span className="text-amber-500 font-medium">{data.length}</span> onay bekliyor
        </p>
      </div>
      <OdemelerClient payments={data} />
    </div>
  )
}
