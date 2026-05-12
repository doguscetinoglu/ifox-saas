import Link from 'next/link'
import { verifyAdminSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/odemeler', label: 'Ödeme Onayları' },
  { href: '/admin/uyeler', label: 'Üyeler' },
  { href: '/admin/otomasyon', label: 'Otomasyon Talepleri' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession()

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/30 flex flex-col p-4 gap-1">
        <div className="mb-4">
          <span className="font-bold text-primary">iFox</span>
          <span className="text-muted-foreground"> Admin</span>
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
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
              Çıkış Yap
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
