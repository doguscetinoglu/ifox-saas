import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create default package
  const pkg = await prisma.package.upsert({
    where: { id: 'default-package' },
    update: { price: 2000, automationLimit: 2 },
    create: { id: 'default-package', name: 'iFox Standart', price: 2000, automationLimit: 2 },
  })
  console.log('Package created:', pkg.name)

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'dogus5455@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const hash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hash,
      name: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Admin created:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
