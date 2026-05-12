import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function PanelDashboard() {
  const session = await verifyActiveSession()
  if (!session.customerId) return <p>Müşteri bilgisi bulunamadı.</p>

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayMessages, todayLeads, recentMessages, employeeActivity] = await Promise.all([
    prisma.message.count({
      where: { customerId: session.customerId, receivedAt: { gte: today } },
    }),
    prisma.lead.count({
      where: { customerId: session.customerId, createdAt: { gte: today } },
    }),
    prisma.message.findMany({
      where: { customerId: session.customerId },
      orderBy: { receivedAt: 'desc' },
      take: 5,
    }),
    prisma.messageReply.groupBy({
      by: ['userId'],
      where: {
        message: { customerId: session.customerId },
        sentAt: { gte: today },
      },
      _count: { id: true },
    }),
  ])

  const totalMessages = await prisma.message.count({ where: { customerId: session.customerId } })
  const repliedMessages = await prisma.message.count({
    where: { customerId: session.customerId, status: 'REPLIED' },
  })
  const responseRate = totalMessages > 0 ? Math.round((repliedMessages / totalMessages) * 100) : 0

  const employeeIds = employeeActivity.map((e) => e.userId)
  const employees = await prisma.user.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, name: true },
  })

  const activityWithNames = employeeActivity.map((a) => ({
    name: employees.find((e) => e.id === a.userId)?.name || 'Bilinmiyor',
    count: a._count.id,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Mesajlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{todayMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Leadler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{todayLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yanıt Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">{responseRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bugünkü Çalışan Aktivitesi</CardTitle>
          </CardHeader>
          <CardContent>
            {activityWithNames.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bugün yanıt verilmedi.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2">Çalışan</th>
                    <th className="text-right py-2">Yanıt</th>
                  </tr>
                </thead>
                <tbody>
                  {activityWithNames.map((a) => (
                    <tr key={a.name} className="border-b">
                      <td className="py-2">{a.name}</td>
                      <td className="py-2 text-right font-medium">{a.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Son Mesajlar</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz mesaj yok.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((m) => (
                  <div key={m.id} className="flex gap-3 items-start border-b pb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{m.senderName}</p>
                      <p className="text-muted-foreground text-sm truncate">{m.content}</p>
                      <p className="text-xs text-muted-foreground/60">{formatDate(m.receivedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
