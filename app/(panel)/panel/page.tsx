import { prisma } from '@/lib/prisma'
import { verifyActiveSession } from '@/lib/dal'
import Link from 'next/link'
import { Card3D } from '@/components/ui/card-3d'

export default async function PanelDashboard() {
  const session = await verifyActiveSession()

  const [subs, products] = await Promise.all([
    prisma.userSubscription.findMany({
      where: { userId: session.userId },
      include: { product: true },
    }),
    prisma.product.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const activeCount = subs.filter((s) => s.status === 'ACTIVE').length

  const getSubForProduct = (productId: string) =>
    subs.find((s) => s.productId === productId)

  const GRADIENT_MAP: Record<string, string> = {
    'stat-blue': 'stat-blue',
    'stat-green': 'stat-green',
    'stat-violet': 'stat-violet',
    'stat-rose': 'stat-rose',
    'stat-cyan': 'stat-cyan',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Merhaba, {session.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount > 0
              ? <><span className="text-green-500 font-medium">{activeCount} aktif</span> aboneliğiniz var</>
              : 'Henüz aktif aboneliğiniz yok'}
          </p>
        </div>
        <div className="text-xs text-muted-foreground glass-subtle px-3 py-1.5 rounded-xl">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => {
          const sub = getSubForProduct(product.id)
          const isActive = sub?.status === 'ACTIVE'
          const isPending = sub?.status === 'PENDING'
          const gradient = GRADIENT_MAP[product.gradient] ?? 'stat-blue'

          if (isActive) {
            return (
              <Card3D key={product.id} className={`${gradient} rounded-2xl p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                    {product.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-400/30 text-green-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    Aktif
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-5">{product.description}</p>
                <Link href={`/panel/${product.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl">
                  Yönet →
                </Link>
              </Card3D>
            )
          }

          if (isPending) {
            return (
              <Card3D key={product.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center text-2xl">
                    {product.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Onay Bekleniyor
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1">{product.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{product.description}</p>
                <button disabled
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-muted text-muted-foreground cursor-not-allowed opacity-60">
                  Onay Bekleniyor...
                </button>
              </Card3D>
            )
          }

          return (
            <Card3D key={product.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center text-2xl grayscale opacity-60">
                  {product.icon}
                </div>
                <span className="text-lg">🔒</span>
              </div>
              <h3 className="font-bold text-base mb-1 opacity-70">{product.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 opacity-60">{product.description}</p>
              <Link href={`/odeme/${product.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors">
                Satın Al →
              </Link>
            </Card3D>
          )
        })}
      </div>
    </div>
  )
}
