'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarLinkProps {
  href: string
  icon: string
  label: string
}

export function SidebarLink({ href, icon, label }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary/15 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </Link>
  )
}
