import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma';

const connectionString = (process.env.DATABASE_URL ?? '')
  .replace(/([?&])sslmode=require(&?)/, (_, p, s) => (s ? p : ''))
  .replace(/[?&]$/, '');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.pricingPolicy.deleteMany({});

  await prisma.pricingPolicy.createMany({
    data: [
      {
        role: 'STUDENT',
        basePrice: 3000,
        pricePerHour: 5000,
        maxDailyPrice: 30000,
        billingCycle: 'MONTHLY',
        effectiveFrom: new Date('2026-01-01'),
      },
      {
        role: 'STAFF',
        basePrice: 0,
        pricePerHour: 0,
        maxDailyPrice: 0,
        billingCycle: 'FREE',
        effectiveFrom: new Date('2026-01-01'),
      },
      {
        role: 'OPERATOR',
        basePrice: 0,
        pricePerHour: 0,
        maxDailyPrice: 0,
        billingCycle: 'FREE',
        effectiveFrom: new Date('2026-01-01'),
      },
      {
        role: 'GUEST',
        basePrice: 5000,
        pricePerHour: 10000,
        maxDailyPrice: 50000,
        billingCycle: 'PAY_NOW',
        effectiveFrom: new Date('2026-01-01'),
      },
    ],
  });

  const count = await prisma.pricingPolicy.count();
  console.log(`Seeded ${count} pricing policies`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
