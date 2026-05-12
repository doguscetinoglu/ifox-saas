import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function PanelDashboard() {
  const session = await verifyActiveSession()
  if (!session.customerId) return <p className="text-muted-foreground">Müşteri bilgisi bulunamadı.</p>

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayMessages, todayLeads, recentMessages, employeeActivity] = await Promise.all([
    prisma.message.count({ where: { customerId: session.customerId, receivedAt: { gte: today } } }),
    prisma.lead.count({ where: { customerId: session.customerId, createdAt: { gte: today } } }),
    prisma.message.findMany({
      where: { customerId: session.customerId },
      orderBy: { receivedAt: 'desc' },
      take: 5,
    }),
    prisma.messageReply.groupBy({
      by: ['userId'],
      where: { message: { customerId: session.customerId }, sentAt: { gte: today } },
      _count: { id: true },
    }),
  ])

  const totalMessages = await prisma.message.count({ where: { customerId: session.customerId } })
  const repliedMessages = await prisma.message.count({ where: { customerId: session.customerId, status: 'REPLIED' } })
  const responseRate = totalMessages > 0 ? Math.round((repliedMessages / totalMessages) * 100) : 0

  const employeeIds = employeeActivity.map((e) => e.userId)
  const employees = await prisma.user.findMany({ where: { id: { in: employeeIds } }, select: { id: true, name: true } })
  const activityWithNames = employeeActivity.map((a) => ({
    name: employees.find((e) => e.id === a.userId)?.name || 'Bilinmiyor',
    count: a._count.id,
  }))

  const stats = [
    { label: 'Bugünkü Mesajlar', value: todayMessages, sub: 'gelen DM', gradient: 'stat-blue', icon: '💬' },
    { label: 'Bugünkü Leadler', value: todayLeads, sub: 'yeni lead', gradient: 'stat-green', icon: '🎯' },
    { label: 'Yanıt Oranı', value: `${responseRate}%`, sub: 'tüm zamanlar', gradient: 'stat-cyan', icon: '📊' },
    { label: 'Toplam Mesaj', value: totalMessages, sub: 'toplam', gradient: 'stat-violet', icon: '📱' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Bugünkü özet</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`card-3d ${s.gradient} rounded-2xl p-5 text-white cursor-default`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-bold tracking-tight mb-0.5">{s.value}</div>
            <div className="text-xs font-medium opacity-90">{s.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Employee activity */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">Bugünkü Çalışan Aktivitesi</h2>
          {activityWithNames.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Bugün yanıt verilmedi.</p>
          ) : (
            <div className="space-y-2">
              {activityWithNames.map((a) => (
                <div key={a.name} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg stat-blue flex items-center justify-center text-white text-xs font-bold">
                      {a.name[0]}
                    </div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{a.count} yanıt</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Son Mesajlar</h2>
            <Link href="/panel/mesajlar" className="text-xs text-primary hover:underline">Tümünü gör →</Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Henüz mesaj yok.</p>
          ) : (
            <div className="space-y-1">
              {recentMessages.map((m) => (
                <Link key={m.id} href="/panel/mesajlar"
                  className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-black/3 dark:hover:bg-white/3 rounded-lg px-1 transition-colors">
                  <div className="w-7 h-7 rounded-lg stat-rose flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {m.senderName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.senderName}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(m.receivedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
