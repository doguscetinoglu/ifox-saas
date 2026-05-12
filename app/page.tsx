import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  const features = [
    {
      icon: '💬',
      title: 'Merkezi Mesaj Kutusu',
      desc: 'Tüm Instagram DM\'lerini tek ekranda görün, yanıtlayın ve takip edin.',
    },
    {
      icon: '🎯',
      title: 'Lead Takibi',
      desc: 'Potansiyel müşterileri otomatik veya manuel olarak etiketleyin, kayıt altına alın.',
    },
    {
      icon: '👥',
      title: 'Ekip Yönetimi',
      desc: 'Çalışanlarınıza erişim tanıyın, kim ne yanıtladı kayıt altında olsun.',
    },
    {
      icon: '📊',
      title: 'Detaylı Raporlar',
      desc: 'Günlük, haftalık, aylık ve yıllık raporlar. Performansı analiz edin.',
    },
    {
      icon: '🤖',
      title: 'Otomasyon',
      desc: 'N8N üzerinden güçlü otomasyon entegrasyonları. 2 talep pakete dahil.',
    },
    {
      icon: '🔗',
      title: 'ManyChat Entegrasyonu',
      desc: 'Instagram hesabınızı bağlayın, mesajlar otomatik sisteme düşsün.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">iFox</span>
            <span className="text-xl font-semibold text-muted-foreground">Social</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/giris">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/kayit">
              <Button>Katıl</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Badge className="mb-4" variant="secondary">ManyChat Entegrasyonlu</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Instagram Mesajlarını<br />
          <span className="text-primary">Profesyonelce Yönet</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Tüm sosyal medya mesajlarını tek panelden görün, yanıtlayın ve lead&apos;e dönüştürün.
          Ekibinizle birlikte çalışın, raporlarla büyüyün.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/kayit">
            <Button size="lg" className="px-8">Hemen Başla</Button>
          </Link>
          <Link href="#ozellikler">
            <Button size="lg" variant="outline" className="px-8">Özellikleri Gör</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="bg-muted/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Her Şey Tek Panelde</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyatlandirma" className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Basit Fiyatlandırma</h2>
          <p className="text-muted-foreground mb-12">Sürpriz yok. Saklı ücret yok.</p>
          <div className="max-w-sm mx-auto">
            <Card className="border-2 border-primary shadow-lg">
              <CardContent className="p-8">
                <Badge className="mb-4">Standart Plan</Badge>
                <div className="text-5xl font-bold mb-1">₺2.000</div>
                <div className="text-muted-foreground mb-8">/ ay</div>
                <ul className="text-sm text-left space-y-3 mb-8">
                  {[
                    'Instagram mesaj yönetimi',
                    'Lead takibi ve kayıt',
                    'Ekip üyesi erişimi',
                    'Günlük/Haftalık/Aylık raporlar',
                    '2 otomasyon talebi (dahil)',
                    'ManyChat entegrasyonu',
                    'N8N otomasyon desteği',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-primary">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/kayit">
                  <Button className="w-full" size="lg">Şimdi Başla</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Hemen Katıl</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Sosyal medya mesajlarını daha verimli yönet. Leadleri kaçırma.
          </p>
          <Link href="/kayit">
            <Button size="lg" variant="secondary" className="px-10">Hemen Başla</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} iFox Social Media Control. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  )
}
