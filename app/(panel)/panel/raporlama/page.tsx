import { redirect } from 'next/navigation'
import { verifyActiveSession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'

export default async function RaporlamaPage() {
  const session = await verifyActiveSession()

  const sub = await prisma.userSubscription.findUnique({
    where: { userId_productId: { userId: session.userId, productId: 'raporlama' } },
  })
  if (sub?.status !== 'ACTIVE') redirect('/panel')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    ciroAy,
    ciroGecenAy,
    borcToplamlar,
    crmStats,
    subs,
  ] = await Promise.all([
    prisma.ciroKayit.aggregate({ where: { userId: session.userId, tarih: { gte: startOfMonth } }, _sum: { tutar: true }, _count: true }),
    prisma.ciroKayit.aggregate({ where: { userId: session.userId, tarih: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { tutar: true } }),
    prisma.borcMusteri.findMany({
      where: { userId: session.userId },
      include: { borclar: { where: { durum: { not: 'ODENDI' } } } },
    }),
    prisma.crmMusteri.aggregate({ where: { userId: session.userId }, _count: true }),
    prisma.userSubscription.findMany({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: { product: { select: { name: true } } },
    }),
  ])

  const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const toplamBekleyenBorc = borcToplamlar.reduce((s, m) => s + m.borclar.reduce((ss, b) => ss + b.tutar, 0), 0)
  const buAyCiro = ciroAy._sum.tutar ?? 0
  const gecenAyCiro = ciroGecenAy._sum.tutar ?? 0
  const ciroFark = gecenAyCiro > 0 ? ((buAyCiro - gecenAyCiro) / gecenAyCiro) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">📊 Raporlama</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} özeti
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: '📈', label: 'Bu Ay Ciro', value: `₺${fmt(buAyCiro)}`,
            sub: gecenAyCiro > 0 ? `${ciroFark >= 0 ? '+' : ''}${ciroFark.toFixed(1)}% geçen aya göre` : `${ciroAy._count} kayıt`,
            gradient: 'stat-blue', positive: ciroFark >= 0,
          },
          {
            icon: '💰', label: 'Bekleyen Borç', value: `₺${fmt(toplamBekleyenBorc)}`,
            sub: `${borcToplamlar.length} müşteri`,
            gradient: 'stat-rose', positive: false,
          },
          {
            icon: '🦊', label: 'CRM Müşteri', value: String(crmStats._count),
            sub: 'toplam müşteri',
            gradient: 'stat-violet', positive: true,
          },
          {
            icon: '✅', label: 'Aktif Modül', value: String(subs.length),
            sub: subs.map((s) => s.product.name).join(', ') || 'yok',
            gradient: 'stat-green', positive: true,
          },
        ].map((card) => (
          <div key={card.label} className={`${card.gradient} rounded-2xl p-5 text-white`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs text-white/70">{card.label}</p>
            <p className="text-xl font-bold mt-0.5">{card.value}</p>
            <p className={`text-xs mt-1 ${card.positive ? 'text-white/60' : 'text-white/60'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Aktif Abonelikler</h2>
          {subs.length > 0 ? (
            <div className="space-y-2">
              {subs.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-sm">{s.product.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-500 font-medium">Aktif</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aktif abonelik yok</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Borç Durumu — Müşteriler</h2>
          {borcToplamlar.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {borcToplamlar
                .map((m) => ({ ...m, toplam: m.borclar.reduce((s, b) => s + b.tutar, 0) }))
                .filter((m) => m.toplam > 0)
                .sort((a, b) => b.toplam - a.toplam)
                .map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm">{m.ad}</span>
                    <span className="text-sm font-semibold text-red-500">₺{fmt(m.toplam)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Bekleyen borç yok</p>
          )}
        </div>
      </div>
    </div>
  )
}
