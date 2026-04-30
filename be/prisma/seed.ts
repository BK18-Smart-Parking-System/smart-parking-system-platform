import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, Role, SlotStatus } from '../generated/prisma';

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

const ALLOWED_ROLES = [
  Role.ADMIN,
  Role.OPERATOR,
  Role.STUDENT,
  Role.STAFF,
  Role.GUEST,
];

type ZoneSeedConfig = {
  code: string;
  name: string;
  slotCount: number;
};

const ZONES: ZoneSeedConfig[] = [
  { code: 'ZONE_A', name: 'Khu A', slotCount: 80 },
  { code: 'ZONE_B', name: 'Khu B', slotCount: 40 },
  { code: 'ZONE_C', name: 'Khu C', slotCount: 60 },
];

function formatSlotLabel(index: number): string {
  return String(index).padStart(2, '0');
}

async function seedZoneWithSlots(prisma: PrismaClient, zoneConfig: ZoneSeedConfig) {
  const expectedSensorCodes: string[] = [];

  const zone = await prisma.parkingZone.upsert({
    where: { code: zoneConfig.code },
    update: {
      name: zoneConfig.name,
      capacity: zoneConfig.slotCount,
      allowedRoles: ALLOWED_ROLES,
    },
    create: {
      code: zoneConfig.code,
      name: zoneConfig.name,
      capacity: zoneConfig.slotCount,
      currentOccupancy: 0,
      allowedRoles: ALLOWED_ROLES,
    },
  });

  for (let index = 1; index <= zoneConfig.slotCount; index += 1) {
    const padded = formatSlotLabel(index);
    const slotName = `${zoneConfig.code.replace('ZONE_', '')}-${`S${padded}`}`;
    const sensorCode = `${zoneConfig.code}-S${padded}`;
    expectedSensorCodes.push(sensorCode);

    await prisma.parkingSlot.upsert({
      where: { sensorCode },
      update: {
        name: slotName,
        zoneId: zone.id,
      },
      create: {
        name: slotName,
        zoneId: zone.id,
        sensorCode,
        status: SlotStatus.EMPTY,
      },
    });
  }

  const legacySlots = await prisma.parkingSlot.findMany({
    where: {
      zoneId: zone.id,
      sensorCode: { notIn: expectedSensorCodes },
    },
    select: {
      id: true,
    },
  });

  if (legacySlots.length > 0) {
    const legacySlotIds = legacySlots.map((slot) => slot.id);

    await prisma.parkingSession.updateMany({
      where: {
        slotId: {
          in: legacySlotIds,
        },
      },
      data: {
        slotId: null,
      },
    });

    await prisma.parkingSlot.deleteMany({
      where: {
        id: {
          in: legacySlotIds,
        },
      },
    });
  }

  const occupiedCount = await prisma.parkingSlot.count({
    where: { zoneId: zone.id, status: SlotStatus.OCCUPIED },
  });

  await prisma.parkingZone.update({
    where: { id: zone.id },
    data: {
      capacity: zoneConfig.slotCount,
      currentOccupancy: occupiedCount,
    },
  });
}

async function main() {
  // Khởi tạo Prisma Client
  const prisma = createPrismaClient();

  try {
    // Seed dữ liệu cho các khu vực đỗ xe và chỗ đỗ
    for (const zone of ZONES) {
      await seedZoneWithSlots(prisma, zone);
    }
    // Seed dữ liệu cho chính sách giá
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
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
