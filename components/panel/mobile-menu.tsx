'use client'

import { useState } from 'react'
import { SidebarLink } from './sidebar-link'
import { logout } from '@/app/actions/auth'

type NavItem = { href: string; icon: string; label: string }

interface MobileMenuProps {
  navItems: NavItem[]
  name: string
  email: string
  initials: string
}

export function MobileMenu({ navItems, name, email, initials }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center glass-subtle active:scale-95 transition-all"
        aria-label="Menü aç"
      >
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="0" y1="1" x2="16" y2="1" />
          <line x1="0" y1="7" x2="16" y2="7" />
          <line x1="0" y1="13" x2="16" y2="13" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 sidebar-glass flex flex-col md:hidden transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              🦊
            </div>
            <div className="leading-none">
              <span className="font-bold text-sm gradient-text">iFox</span>
              <span className="text-xs text-muted-foreground ml-1">Social</span>
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

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" onClick={() => setOpen(false)}>
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
              <p className="text-xs font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
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
    </>
  )
}
