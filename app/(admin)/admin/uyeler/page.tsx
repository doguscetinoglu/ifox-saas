import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function UyelerPage() {
  const customers = await prisma.customer.findMany({
    include: { user: true, package: true, _count: { select: { messages: true, leads: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const statusBadge = (s: string) => {
    if (s === 'ACTIVE') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">Aktif</span>
    if (s === 'PENDING') return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500">Bekliyor</span>
    return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">Askıya Alındı</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Üyeler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{customers.length} kayıtlı müşteri</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60">
              {['Şirket', 'E-posta', 'Paket', 'Mesaj', 'Lead', 'Durum', 'Kayıt'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl stat-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.companyName[0]}
                    </div>
                    <span className="font-medium">{c.companyName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.user.email}</td>
                <td className="px-5 py-3.5 text-xs">{c.package.name}</td>
                <td className="px-5 py-3.5 font-semibold text-primary">{c._count.messages}</td>
                <td className="px-5 py-3.5 font-semibold text-green-500">{c._count.leads}</td>
                <td className="px-5 py-3.5">{statusBadge(c.user.status)}</td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">Henüz üye yok.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
