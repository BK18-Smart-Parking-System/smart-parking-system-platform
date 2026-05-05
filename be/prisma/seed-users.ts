import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, Role } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

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

const NAMES = [
  'Nguyễn Văn An',
  'Trần Thị Bích',
  'Lê Hoàng Cường',
  'Phạm Minh Đức',
  'Hoàng Thị Hoa',
  'Đỗ Quốc Huy',
  'Vũ Thị Hương',
  'Ngô Thanh Hải',
  'Bùi Minh Hiếu',
  'Đặng Thị Hạnh',
  'Phan Văn Khoa',
  'Lâm Thị Lan',
  'Lý Minh Long',
  'Chu Thị Mai',
  'Dương Văn Nam',
  'Hồ Thị Ngọc',
  'Mai Thanh Phong',
  'Tạ Thị Quỳnh',
  'Trịnh Văn Sơn',
  'Đinh Thị Trang',
];

async function main() {
  const prisma = createPrismaClient();

  try {
    const password = 'password123';
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`🔐 Common password: "${password}" → hash: ${hashedPassword}`);
    console.log(`\n📝 Creating ${NAMES.length} users...`);

    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < NAMES.length; i++) {
      const fullName = NAMES[i];
      const index = i + 1;
      const isStudent = Math.random() < 0.5;
      const role = isStudent ? Role.STUDENT : Role.STAFF;
      const prefix = isStudent ? 'SV' : 'CB';
      const universityId = `${prefix}${String(index).padStart(3, '0')}`;
      const username = `user${String(index).padStart(2, '0')}`;
      const email = `user${String(index).padStart(2, '0')}@hcmut.edu.vn`;

      // Check if username already exists
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
            { universityId },
          ],
        },
      });

      if (existing) {
        console.log(`  ⏭️  [${index}/${NAMES.length}] ${fullName} (${role}) — already exists, skipped`);
        skippedCount++;
        continue;
      }

      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          universityId,
          role,
        },
      });

      console.log(`  ✅ [${index}/${NAMES.length}] ${fullName} — username: ${username}, email: ${email}, role: ${role}`);
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
