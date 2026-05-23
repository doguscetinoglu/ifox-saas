import { prisma } from '@/lib/prisma'
import { verifyAdminSession } from '@/lib/dal'
import Link from 'next/link'

export default async function AdminDashboard() {
  await verifyAdminSession()

  const [pendingPayments, totalActiveUsers, totalSubs, products] = await Promise.all([
    prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
    prisma.userSubscription.groupBy({ by: ['userId'], where: { status: 'ACTIVE' } }).then((r) => r.length),
    prisma.userSubscription.count({ where: { status: 'ACTIVE' } }),
    prisma.product.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { subscriptions: { where: { status: 'ACTIVE' } } } },
      },
    }),
  ])

  const stats = [
    { label: 'Bekleyen Ödemeler', value: pendingPayments, gradient: 'stat-rose', icon: '💳', href: '/admin/odemeler', sub: 'onay bekliyor' },
    { label: 'Aktif Kullanıcı', value: totalActiveUsers, gradient: 'stat-green', icon: '👥', href: '/admin/uyeler', sub: 'tekil kullanıcı' },
    { label: 'Toplam Abonelik', value: totalSubs, gradient: 'stat-blue', icon: '📦', href: '/admin/odemeler', sub: 'aktif abonelik' },
    { label: 'Ürün Sayısı', value: products.length, gradient: 'stat-violet', icon: '🧩', href: '#', sub: 'toplam ürün' },
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
            className={`card-3d ${s.gradient} rounded-2xl p-5 text-white block hover:scale-[1.02] transition-transform`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-bold tracking-tight mb-0.5">{s.value}</div>
            <div className="text-xs font-medium opacity-90">{s.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Ürün Bazlı Aktif Abonelik</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${p.gradient} flex items-center justify-center text-xl shrink-0`}>
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p._count.subscriptions} aktif abone</p>
              </div>
              <span className="text-2xl font-bold text-foreground">{p._count.subscriptions}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/odemeler', icon: '💳', label: 'Ödeme Onayları', desc: 'Bekleyen ödemeleri yönet' },
          { href: '/admin/uyeler', icon: '👥', label: 'Üye Listesi', desc: 'Tüm kullanıcıları görüntüle' },
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
