import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Card3D } from '@/components/ui/card-3d'

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
  const totalLeads = await prisma.lead.count({ where: { customerId: session.customerId } })

  const employeeIds = employeeActivity.map((e) => e.userId)
  const employees = await prisma.user.findMany({ where: { id: { in: employeeIds } }, select: { id: true, name: true } })
  const activityWithNames = employeeActivity.map((a) => ({
    name: employees.find((e) => e.id === a.userId)?.name || 'Bilinmiyor',
    count: a._count.id,
  }))

  const stats = [
    { label: 'Bugünkü Mesajlar', value: todayMessages, sub: 'gelen DM', gradient: 'stat-blue', glow: 'blue', icon: '💬' },
    { label: 'Bugünkü Leadler', value: todayLeads, sub: 'yeni lead', gradient: 'stat-green', glow: 'green', icon: '🎯' },
    { label: 'Yanıt Oranı', value: `${responseRate}%`, sub: 'tüm zamanlar', gradient: 'stat-cyan', glow: 'cyan', icon: '📊' },
    { label: 'Toplam Lead', value: totalLeads, sub: 'toplam', gradient: 'stat-violet', glow: 'violet', icon: '🏆' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hoş geldiniz, <span className="text-foreground font-medium">{session.name}</span>
          </p>
        </div>
        <div className="text-xs text-muted-foreground glass-subtle px-3 py-1.5 rounded-xl">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`glow-${s.glow} rounded-2xl`}>
            <Card3D className={`${s.gradient} rounded-2xl p-5 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                  {s.icon}
                </div>
                <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse mt-1" />
              </div>
              <div className="text-3xl font-bold tracking-tight mb-0.5" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {s.value}
              </div>
              <div className="text-xs font-semibold opacity-95 mt-1">{s.label}</div>
              <div className="text-xs opacity-55 mt-0.5">{s.sub}</div>
            </Card3D>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Employee activity */}
        <div className="glass rounded-2xl p-5 gradient-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">👥</span>
            <h2 className="text-sm font-semibold">Bugünkü Aktivite</h2>
          </div>
          {activityWithNames.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-3xl mb-2 opacity-30">😴</span>
              <p className="text-sm text-muted-foreground">Bugün yanıt verilmedi.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activityWithNames.map((a) => (
                <div key={a.name} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl stat-indigo flex items-center justify-center text-white text-xs font-bold">
                      {a.name[0]}
                    </div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-primary/20 w-16">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (a.count / 20) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-primary w-12 text-right">{a.count} yanıt</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="glass rounded-2xl p-5 gradient-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <h2 className="text-sm font-semibold">Son Mesajlar</h2>
            </div>
            <Link href="/panel/mesajlar" className="text-xs text-primary hover:underline font-medium">Tümünü gör →</Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-3xl mb-2 opacity-30">📭</span>
              <p className="text-sm text-muted-foreground">Henüz mesaj yok.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentMessages.map((m) => (
                <Link key={m.id} href="/panel/mesajlar"
                  className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-black/3 dark:hover:bg-white/3 rounded-lg px-1 transition-colors">
                  <div className="w-8 h-8 rounded-xl stat-rose flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
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

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/panel/mesajlar', label: 'Mesaj Kutusu', icon: '💬', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20' },
          { href: '/panel/leadler', label: 'Leadler', icon: '🎯', color: 'from-green-500/10 to-emerald-500/10 border-green-500/20' },
          { href: '/panel/raporlar', label: 'Raporlar', icon: '📈', color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20' },
          { href: '/panel/hesap', label: 'Hesabım', icon: '👤', color: 'from-rose-500/10 to-pink-500/10 border-rose-500/20' },
        ].map((q) => (
          <Link key={q.href} href={q.href}
            className={`flex items-center gap-3 p-4 rounded-2xl border bg-gradient-to-br ${q.color} hover:scale-[1.02] active:scale-[0.98] transition-all`}>
            <span className="text-xl">{q.icon}</span>
            <span className="text-sm font-medium">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
