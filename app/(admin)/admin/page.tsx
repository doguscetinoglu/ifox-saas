import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [pendingPayments, activeMembers, pendingAutomations, totalMessages] = await Promise.all([
    prisma.paymentRequest.count({ where: { status: 'PENDING', notifiedAt: { not: null } } }),
    prisma.user.count({ where: { status: 'ACTIVE', role: 'OWNER' } }),
    prisma.automationRequest.count({ where: { status: 'PENDING' } }),
    prisma.message.count(),
  ])

  const stats = [
    { label: 'Bekleyen Ödemeler', value: pendingPayments, gradient: 'stat-rose', icon: '💳', href: '/admin/odemeler', sub: 'onay bekliyor' },
    { label: 'Aktif Üyeler', value: activeMembers, gradient: 'stat-green', icon: '👥', href: '/admin/uyeler', sub: 'aktif müşteri' },
    { label: 'Bekleyen Otomasyon', value: pendingAutomations, gradient: 'stat-cyan', icon: '🤖', href: '/admin/otomasyon', sub: 'talep bekliyor' },
    { label: 'Toplam Mesaj', value: totalMessages, gradient: 'stat-blue', icon: '💬', href: '#', sub: 'tüm zamanlar' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform genel durumu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className={`card-3d ${s.gradient} rounded-2xl p-5 text-white block`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-bold tracking-tight mb-0.5">{s.value}</div>
            <div className="text-xs font-medium opacity-90">{s.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/odemeler', icon: '💳', label: 'Ödeme Onayları', desc: 'Bekleyen ödemeleri yönet' },
          { href: '/admin/uyeler', icon: '👥', label: 'Üye Listesi', desc: 'Tüm müşterileri görüntüle' },
          { href: '/admin/otomasyon', icon: '🤖', label: 'Otomasyon Talepleri', desc: 'Müşteri taleplerini yönet' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="glass rounded-2xl p-5 hover:bg-primary/5 transition-colors group">
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{item.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
