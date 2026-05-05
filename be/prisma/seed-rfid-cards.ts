import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, CardStatus } from '../generated/prisma';

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

// Generate a realistic-looking RFID UID (hex string, 8-14 characters)
function generateUid(index: number): string {
  // Use a fixed prefix + index to ensure uniqueness and repeatability
  const hexIndex = index.toString(16).toUpperCase().padStart(4, '0');
  return `A0B1C2${hexIndex}`;
}

async function main() {
  const prisma = createPrismaClient();

  try {
    // Fetch all users ordered by username
    const users = await prisma.user.findMany({
      orderBy: { username: 'asc' },
    });

    if (users.length === 0) {
      console.log('⚠️  No users found in database. Please run seed-users.ts first.');
      return;
    }

    console.log(`📋 Found ${users.length} users in database.\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const index = i + 1;
      const uid = generateUid(index);

      // Check if user already has a card
      const existingCard = await prisma.rfidCard.findFirst({
        where: { userId: user.id },
      });

      if (existingCard) {
        console.log(`  ⏭️  [${index}/${users.length}] ${user.fullName} (${user.username}) — already has card UID: ${existingCard.uid}, skipped`);
        skippedCount++;
        continue;
      }

      // Check if UID already exists
      const existingUid = await prisma.rfidCard.findUnique({
        where: { uid },
      });

      if (existingUid) {
        console.log(`  ⏭️  [${index}/${users.length}] UID ${uid} already exists, skipped`);
        skippedCount++;
        continue;
      }

      await prisma.rfidCard.create({
        data: {
          uid,
          status: CardStatus.ACTIVE,
          isGuestCard: false,
          userId: user.id,
        },
      });

      console.log(`  ✅ [${index}/${users.length}] ${user.fullName} (${user.username}, ${user.role}) → Card UID: ${uid}`);
      createdCount++;
    }

    console.log(`\n🎉 Done! Created: ${createdCount}, Skipped: ${skippedCount}`);
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
