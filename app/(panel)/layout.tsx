import Link from 'next/link'
import { verifyActiveSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import NotificationBell from '@/components/panel/notification-bell'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyActiveSession()
  const isOwner = session.role === 'OWNER'

  const navItems = [
    ...(isOwner ? [{ href: '/panel', label: '📊 Dashboard' }] : []),
    { href: '/panel/mesajlar', label: '💬 Mesajlar' },
    ...(isOwner ? [
      { href: '/panel/leadler', label: '🎯 Leadler' },
      { href: '/panel/raporlar', label: '📈 Raporlar' },
      { href: '/panel/otomasyon-talebi', label: '🤖 Otomasyon' },
      { href: '/panel/ayarlar', label: '⚙️ Ayarlar' },
    ] : []),
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/30 flex flex-col p-4 gap-1 shrink-0">
        <div className="mb-4">
          <span className="font-bold text-primary">iFox</span>
          <span className="text-muted-foreground"> Social</span>
        </div>
        <Separator className="mb-3" />
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto">
          <Separator className="mb-3" />
          <div className="text-xs text-muted-foreground px-3 mb-2 truncate">{session.email}</div>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
              Çıkış Yap
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-end px-6 gap-3 shrink-0">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
