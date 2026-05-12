import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const [pendingPayments, activeMembers, pendingAutomations] = await Promise.all([
    prisma.paymentRequest.count({ where: { status: 'PENDING', notifiedAt: { not: null } } }),
    prisma.user.count({ where: { status: 'ACTIVE', role: 'OWNER' } }),
    prisma.automationRequest.count({ where: { status: 'PENDING' } }),
  ])

  const stats = [
    { label: 'Bekleyen Ödemeler', value: pendingPayments, color: 'text-amber-600' },
    { label: 'Aktif Üyeler', value: activeMembers, color: 'text-green-600' },
    { label: 'Bekleyen Otomasyon', value: pendingAutomations, color: 'text-blue-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
