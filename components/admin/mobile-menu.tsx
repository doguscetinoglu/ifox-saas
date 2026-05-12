'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

type NavItem = { href: string; icon: string; label: string }

export function AdminMobileMenu({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center glass-subtle active:scale-95 transition-all"
        aria-label="Admin menü"
      >
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="0" y1="1" x2="16" y2="1" />
          <line x1="0" y1="7" x2="16" y2="7" />
          <line x1="0" y1="13" x2="16" y2="13" />
        </svg>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 sidebar-glass flex flex-col md:hidden transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' }}>
              ⚡
            </div>
            <div className="leading-none">
              <span className="font-bold text-sm gradient-text">iFox</span>
              <span className="text-xs text-muted-foreground ml-1">Admin</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="h-px bg-border mx-4" />

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                }`}>
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="h-px bg-border mx-4" />

        <div className="px-3 py-4">
          <span className="block text-xs font-medium px-3 py-1.5 mb-2 rounded-full bg-red-500/10 text-red-500 text-center">Admin Panel</span>
          <form action={logout}>
            <button type="submit"
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-xl hover:bg-destructive/8 text-left cursor-pointer">
              → Çıkış Yap
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
