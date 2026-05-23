import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const PRODUCTS = [
  { id: 'ciro-takip', name: 'Ciro Takip', slug: 'ciro-takip', description: 'Günlük, haftalık ve aylık ciro takibinizi kolayca yapın. Satış performansınızı analiz edin, hedef belirleyin.', price: 1000, icon: '📈', gradient: 'stat-blue', isRequest: false, sortOrder: 1 },
  { id: 'borc-takip', name: 'Borç Takip', slug: 'borc-takip', description: 'Müşteri alacak ve borçlarınızı tek ekranda yönetin. Vadesi geçen ödemeleri anında görün.', price: 1000, icon: '💰', gradient: 'stat-green', isRequest: false, sortOrder: 2 },
  { id: 'fox-crm', name: 'Fox CRM', slug: 'fox-crm', description: 'Müşteri ilişkilerini güçlendirin. Destek talepleri, proje takibi ve müşteri yönetimi tek panelde.', price: 1000, icon: '🦊', gradient: 'stat-violet', isRequest: false, sortOrder: 3 },
  { id: 'otomasyon', name: 'Sosyal Medya Otomasyonu', slug: 'otomasyon', description: 'ManyChat ile Instagram, Facebook ve WhatsApp\'ta bot akışları kurun. Uzman ekibimiz sizin için özel kurulum yapar.', price: 1000, icon: '🤖', gradient: 'stat-rose', isRequest: true, sortOrder: 4 },
  { id: 'sirket-otomasyonu', name: 'Şirket Otomasyonu', slug: 'sirket-otomasyonu', description: 'N8N ile şirket içi iş akışlarınızı otomatikleştirin. 400+ uygulama entegrasyonu, API bağlantıları ve akıllı iş süreçleri.', price: 1000, icon: '⚙️', gradient: 'stat-orange', isRequest: true, sortOrder: 5 },
  { id: 'raporlama', name: 'Raporlama', slug: 'raporlama', description: 'İşletmenizin tüm verilerini görselleştirin. PDF ve Excel export ile profesyonel raporlar oluşturun.', price: 1000, icon: '📊', gradient: 'stat-cyan', isRequest: false, sortOrder: 6 },
]

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({ where: { id: p.id }, update: p, create: p })
    console.log('Ürün:', p.name)
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'dogus5455@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const hash = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: hash, name: 'Admin', role: 'ADMIN', status: 'ACTIVE' },
  })
  console.log('Admin:', adminEmail)
}

main().catch(console.error).finally(() => prisma.$disconnect())
