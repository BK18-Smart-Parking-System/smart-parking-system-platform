import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, Role } from '../generated/prisma';

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const sanitizedConnectionString = connectionString
    .replace(/([?&])sslmode=require(&?)/, (_, prefix, suffix) => {
      if (suffix) {
        return prefix;
      }
      return '';
    })
    .replace(/[?&]$/, '');

  const pool = new Pool({ connectionString: sanitizedConnectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

function generateGuestUid(index: number): string {
  const hexIndex = index.toString(16).toUpperCase().padStart(4, '0');
  return `GUEST${hexIndex}`;
}

async function main() {
  const prisma = createPrismaClient();

  try {
    // 1. Delete all GUEST role users
    const deletedUsers = await prisma.user.deleteMany({
      where: { role: Role.GUEST },
    });
    console.log(`🗑️  Deleted ${deletedUsers.count} GUEST role users`);

    // 2. Delete existing guest cards (isGuestCard = true) to avoid conflicts
    const deletedCards = await prisma.rfidCard.deleteMany({
      where: { isGuestCard: true },
    });
    if (deletedCards.count > 0) {
      console.log(`🗑️  Deleted ${deletedCards.count} existing guest cards`);
    }

    // 3. Create 20 guest RFID cards
    console.log('\n📝 Creating 20 guest RFID cards...');
    let createdCount = 0;

    for (let i = 1; i <= 20; i++) {
      const uid = generateGuestUid(i);

      const existing = await prisma.rfidCard.findUnique({
        where: { uid },
      });

      if (existing) {
        console.log(`  ⏭️  [${i}/20] Guest card UID: ${uid} already exists, skipped`);
        continue;
      }

      await prisma.rfidCard.create({
        data: {
          uid,
          status: 'ACTIVE',
          isGuestCard: true,
          userId: null,
        },
      });

      console.log(`  ✅ [${i}/20] Guest card created — UID: ${uid}`);
      createdCount++;
    }

    console.log(`\n🎉 Done! Created: ${createdCount} guest cards`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
