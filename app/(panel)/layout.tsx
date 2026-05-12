import { verifyActiveSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import { SidebarLink } from '@/components/panel/sidebar-link'
import { MobileMenu } from '@/components/panel/mobile-menu'
import NotificationBell from '@/components/panel/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyActiveSession()
  const isOwner = session.role === 'OWNER'

  const navItems = [
    ...(isOwner ? [{ href: '/panel', icon: '▦', label: 'Dashboard' }] : []),
    { href: '/panel/mesajlar', icon: '💬', label: 'Mesajlar' },
    ...(isOwner ? [
      { href: '/panel/leadler', icon: '🎯', label: 'Leadler' },
      { href: '/panel/raporlar', icon: '📈', label: 'Raporlar' },
      { href: '/panel/otomasyon-talebi', icon: '🤖', label: 'Otomasyon' },
      { href: '/panel/hesap', icon: '👤', label: 'Hesabım' },
      { href: '/panel/ayarlar', icon: '⚙️', label: 'Ayarlar' },
    ] : []),
  ]

  const initials = session.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop only */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col sidebar-glass fixed top-0 left-0 h-full z-30">
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            🦊
          </div>
          <div className="leading-none">
            <span className="font-bold text-sm gradient-text">iFox</span>
            <span className="text-xs text-muted-foreground ml-1">Social</span>
          </div>
        </div>

        <div className="h-px bg-border mx-4" />

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <SidebarLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div className="h-px bg-border mx-4" />

        <div className="px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-subtle mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{session.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.email}</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit"
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-xl hover:bg-destructive/8 text-left cursor-pointer">
              → Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-60">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 sidebar-glass border-b border-border/50">
          <MobileMenu
            navItems={navItems}
            name={session.name || ''}
            email={session.email || ''}
            initials={initials}
          />
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 page-enter panel-bg">{children}</main>
      </div>
    </div>
  )
}
