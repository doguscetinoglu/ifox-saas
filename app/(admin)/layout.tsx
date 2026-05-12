import Link from 'next/link'
import { verifyAdminSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { AdminMobileMenu } from '@/components/admin/mobile-menu'

const navItems = [
  { href: '/admin', icon: '▦', label: 'Dashboard' },
  { href: '/admin/odemeler', icon: '💳', label: 'Ödeme Onayları' },
  { href: '/admin/uyeler', icon: '👥', label: 'Üyeler' },
  { href: '/admin/otomasyon', icon: '🤖', label: 'Otomasyon' },
  { href: '/admin/gelir', icon: '💰', label: 'Gelir Raporu' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession()

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop only */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col sidebar-glass fixed top-0 left-0 h-full z-30">
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' }}>
            ⚡
          </div>
          <div className="leading-none">
            <span className="font-bold text-sm gradient-text">iFox</span>
            <span className="text-xs text-muted-foreground ml-1">Admin</span>
          </div>
        </div>

        <div className="h-px bg-border mx-4" />

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all">
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="h-px bg-border mx-4" />

        <div className="px-3 py-4">
          <form action={logout}>
            <button type="submit"
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-xl hover:bg-destructive/8 text-left cursor-pointer">
              → Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-60">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 sidebar-glass border-b border-border/50">
          <AdminMobileMenu navItems={navItems} />
          <span className="hidden md:inline text-xs font-medium px-3 py-1 rounded-full bg-red-500/10 text-red-500">Admin Panel</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6 page-enter">{children}</main>
      </div>
    </div>
  )
}
