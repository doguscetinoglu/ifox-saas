import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function UyelerPage() {
  const customers = await prisma.customer.findMany({
    include: {
      user: true,
      package: true,
      _count: { select: { messages: true, leads: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusBadge = (s: string) => {
    if (s === 'ACTIVE') return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    if (s === 'PENDING') return <Badge variant="secondary">Bekliyor</Badge>
    return <Badge variant="destructive">Askıya Alındı</Badge>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Üyeler</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tüm Üyeler ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-3">Şirket</th>
                  <th className="text-left p-3">E-posta</th>
                  <th className="text-left p-3">Paket</th>
                  <th className="text-left p-3">Mesajlar</th>
                  <th className="text-left p-3">Leadler</th>
                  <th className="text-left p-3">Durum</th>
                  <th className="text-left p-3">Kayıt</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.companyName}</td>
                    <td className="p-3 text-muted-foreground">{c.user.email}</td>
                    <td className="p-3">{c.package.name}</td>
                    <td className="p-3">{c._count.messages}</td>
                    <td className="p-3">{c._count.leads}</td>
                    <td className="p-3">{statusBadge(c.user.status)}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      Henüz üye yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
