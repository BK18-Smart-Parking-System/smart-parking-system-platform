import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CardStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
  SessionStatus,
  SlotStatus,
} from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  ParkingSessionRecordDto,
  ParkingSimulationResponseDto,
} from './dto/parking.dto';

@Injectable()
export class ParkingService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPricing = {
    basePrice: 3000,
    pricePerHour: 5000,
    maxDailyPrice: 30000,
  };

  async getZonesWithSlots() {
    const zones = await this.prisma.parkingZone.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        slots: {
          orderBy: [{ name: 'asc' }, { sensorCode: 'asc' }],
        },
      },
    });

    return zones.map((zone) => ({
      ...zone,
      slots: zone.slots.map((slot) => ({
        ...slot,
        name: slot.name || this.getSlotName(slot.sensorCode),
      })),
    }));
  }

  async getSessions(): Promise<ParkingSessionRecordDto[]> {
    const sessions = await this.prisma.parkingSession.findMany({
      orderBy: { checkinTime: 'desc' },
      include: {
        card: {
          include: {
            user: true,
          },
        },
        zone: true,
        slot: true,
      },
    });

    return sessions.map((session) => this.mapSession(session));
  }

  async getTransactionHistory(query: any) {
    const page = Math.max(Number(query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 100);
    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    if (query.plate) {
      whereClause.OR = [
        { licensePlateIn: { contains: query.plate, mode: 'insensitive' } },
        { licensePlateOut: { contains: query.plate, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      whereClause.checkinTime = {};
      if (query.startDate) {
        whereClause.checkinTime.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.checkinTime.lte = endDate;
      }
    }

    const [totalItems, pagedSessions, allFilteredSessions] = await Promise.all([
      this.prisma.parkingSession.count({ where: whereClause }),
      this.prisma.parkingSession.findMany({
        where: whereClause,
        include: {
          card: {
            include: {
              user: true,
            },
          },
          zone: true,
          slot: true,
          payment: true,
        },
        orderBy: {
          checkinTime: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.parkingSession.findMany({
        where: whereClause,
        select: {
          checkinTime: true,
          checkoutTime: true,
          calculatedFee: true,
        },
      }),
    ]);

    const totalMinutes = allFilteredSessions.reduce(
      (sum, session) =>
        sum + this.getDurationMinutes(session.checkinTime, session.checkoutTime),
      0,
    );
    const totalFee = allFilteredSessions.reduce(
      (sum, session) => sum + Number(session.calculatedFee ?? 0),
      0,
    );
    const totalSessions = allFilteredSessions.length;

    return {
      items: pagedSessions.map((session) => ({
        id: session.id,
        date: session.checkinTime,
        plate: session.licensePlateOut ?? session.licensePlateIn ?? 'Unrecognized',
        checkinTime: session.checkinTime,
        checkoutTime: session.checkoutTime,
        durationMinutes: this.getDurationMinutes(
          session.checkinTime,
          session.checkoutTime,
        ),
        fee: Number(session.calculatedFee ?? 0),
        status: session.status,
        customerName:
          session.card.user?.fullName ??
          (session.card.isGuestCard ? 'Guest customer' : 'Unknown customer'),
        customerRole: session.card.user?.role ?? Role.GUEST,
        cardUid: session.card.uid,
        paymentMethod: session.payment?.method ?? null,
        paymentStatus: session.payment?.status ?? null,
        zoneName: session.zone?.name ?? null,
        slotName: session.slot?.name ?? session.slot?.sensorCode ?? null,
      })),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
      },
      summary: {
        totalSessions,
        totalMinutes,
        totalFee: Math.round(totalFee),
        averageMinutes: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
        averageFeePerSession:
          totalSessions > 0 ? Math.round(totalFee / totalSessions) : 0,
      },
    };
  }

  async simulateRandomCheckIn(): Promise<ParkingSimulationResponseDto> {
    const session = await this.prisma.$transaction(async (tx) => {
      const availableCards = await tx.rfidCard.findMany({
        where: {
          status: CardStatus.ACTIVE,
          userId: { not: null },
          sessions: {
            none: {
              status: {
                in: [SessionStatus.INITIATED, SessionStatus.PARKING],
              },
            },
          },
        },
        include: {
          user: true,
        },
      });

      if (availableCards.length === 0) {
        throw new BadRequestException(
          'Không có thẻ RFID khả dụng. Tất cả người dùng đã trong bãi hoặc chưa có thẻ được cấp.',
        );
      }

      const emptySlot = await tx.parkingSlot.findFirst({
        where: {
          status: SlotStatus.EMPTY,
        },
        orderBy: [{ name: 'asc' }, { sensorCode: 'asc' }],
      });

      if (!emptySlot) {
        throw new BadRequestException('Bãi giữ xe đã đầy');
      }

      const randomCard =
        availableCards[Math.floor(Math.random() * availableCards.length)];
      const checkinTime = new Date();

      await tx.parkingSlot.update({
        where: { id: emptySlot.id },
        data: {
          status: SlotStatus.OCCUPIED,
          lastUpdated: checkinTime,
        },
      });

      const occupiedCount = await tx.parkingSlot.count({
        where: {
          zoneId: emptySlot.zoneId,
          status: SlotStatus.OCCUPIED,
        },
      });

      await tx.parkingZone.update({
        where: { id: emptySlot.zoneId },
        data: {
          currentOccupancy: occupiedCount,
        },
      });

      return tx.parkingSession.create({
        data: {
          cardId: randomCard.id,
          zoneId: emptySlot.zoneId,
          slotId: emptySlot.id,
          status: SessionStatus.PARKING,
          licensePlateIn: this.generateLicensePlate(),
          checkinTime,
        },
        include: {
          card: {
            include: {
              user: true,
            },
          },
          zone: true,
          slot: true,
        },
      });
    });

    return {
      message: 'Tạo lượt vào bãi thành công.',
      session: this.mapSession(session),
    };
  }

  async simulateRandomCheckOut(): Promise<ParkingSimulationResponseDto> {
    const session = await this.prisma.$transaction(async (tx) => {
      const activeSession = await tx.parkingSession.findFirst({
        where: {
          status: SessionStatus.PARKING,
        },
        orderBy: {
          checkinTime: 'asc',
        },
        select: {
          id: true,
          zoneId: true,
          slotId: true,
          licensePlateIn: true,
          checkinTime: true,
          card: {
            select: {
              isGuestCard: true,
              user: {
                select: {
                  id: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!activeSession) {
        throw new BadRequestException(
          'Không có xe nào trong bãi để thực hiện check-out.',
        );
      }

      const checkoutTime = new Date();
      const role = activeSession.card.isGuestCard
        ? Role.GUEST
        : activeSession.card.user?.role ?? Role.GUEST;
      const calculatedFee = await this.calculateFee(
        tx,
        role,
        activeSession.checkinTime,
        checkoutTime,
      );

      const updatedSession = await tx.parkingSession.update({
        where: { id: activeSession.id },
        data: {
          status: SessionStatus.CLOSED,
          checkoutTime,
          licensePlateOut: activeSession.licensePlateIn,
          calculatedFee,
        },
        include: {
          card: {
            include: {
              user: true,
            },
          },
          zone: true,
          slot: true,
        },
      });

      if (activeSession.card.isGuestCard && calculatedFee > 0) {
        const payment = await tx.paymentTransaction.create({
          data: {
            amount: calculatedFee,
            status: PaymentStatus.SUCCESS,
            method: PaymentMethod.CASH,
            userId: null,
            paidAt: checkoutTime,
          },
        });

        await tx.parkingSession.update({
          where: { id: activeSession.id },
          data: {
            paymentId: payment.id,
          },
        });
      }

      if (activeSession.slotId) {
        await tx.parkingSlot.update({
          where: { id: activeSession.slotId },
          data: {
            status: SlotStatus.EMPTY,
            lastUpdated: checkoutTime,
          },
        });
      }

      if (activeSession.zoneId) {
        const occupiedCount = await tx.parkingSlot.count({
          where: {
            zoneId: activeSession.zoneId,
            status: SlotStatus.OCCUPIED,
          },
        });

        await tx.parkingZone.update({
          where: { id: activeSession.zoneId },
          data: {
            currentOccupancy: occupiedCount,
          },
        });
      }

      return updatedSession;
    });

    return {
      message: 'Xe đã rời bãi thành công.',
      session: this.mapSession(session),
    };
  }

  async toggleSealSlot(slotId: string) {
    const slot = await this.prisma.parkingSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new BadRequestException('Không tìm thấy ô đỗ.');
    }

    if (slot.status === SlotStatus.OCCUPIED) {
      throw new BadRequestException('Không thể niêm phong ô đỗ đang có xe.');
    }

    if (slot.status !== SlotStatus.EMPTY && slot.status !== SlotStatus.MAINTENANCE) {
      throw new BadRequestException(
        'Chỉ có thể niêm phong hoặc bỏ niêm phong ô đang trống.',
      );
    }

    const nextStatus =
      slot.status === SlotStatus.EMPTY
        ? SlotStatus.MAINTENANCE
        : SlotStatus.EMPTY;

    return this.prisma.parkingSlot.update({
      where: { id: slot.id },
      data: {
        status: nextStatus,
        lastUpdated: new Date(),
      },
    });
  }

  private mapSession(session: any): ParkingSessionRecordDto {
    return {
      id: session.id,
      status: session.status,
      checkinTime: session.checkinTime,
      checkoutTime: session.checkoutTime,
      licensePlateIn: session.licensePlateIn,
      licensePlateOut: session.licensePlateOut,
      calculatedFee: session.calculatedFee,
      rfidCard: {
        id: session.card.id,
        uid: session.card.uid,
        status: session.card.status,
        user: session.card.user
          ? {
              id: session.card.user.id,
              username: session.card.user.username,
              fullName: session.card.user.fullName,
              universityId: session.card.user.universityId,
              role: session.card.user.role,
            }
          : null,
      },
      zone: session.zone
        ? {
            id: session.zone.id,
            code: session.zone.code,
            name: session.zone.name,
          }
        : null,
      slot: session.slot
        ? {
            id: session.slot.id,
            name: session.slot.name || this.getSlotName(session.slot.sensorCode),
            sensorCode: session.slot.sensorCode,
            status: session.slot.status,
          }
        : null,
    };
  }

  private getSlotName(sensorCode: string): string {
    if (sensorCode.startsWith('ZONE_')) {
      return sensorCode
        .replace('ZONE_', '')
        .replace('-S', '-S')
        .trim();
    }

    if (sensorCode.startsWith('SS_')) {
      return sensorCode.slice(3);
    }

    return sensorCode;
  }

  private async calculateFee(
    tx: any,
    role: Role,
    checkinTime: Date,
    checkoutTime: Date,
  ) {
    const pricingPolicy = await tx.pricingPolicy.findFirst({
      where: {
        role,
        effectiveFrom: {
          lte: checkoutTime,
        },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: checkoutTime } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    const basePrice = Number(pricingPolicy?.basePrice ?? this.defaultPricing.basePrice);
    const pricePerHour = Number(
      pricingPolicy?.pricePerHour ?? this.defaultPricing.pricePerHour,
    );
    const maxDailyPrice = Number(
      pricingPolicy?.maxDailyPrice ?? this.defaultPricing.maxDailyPrice,
    );

    if (pricingPolicy?.billingCycle === 'FREE') {
      return 0;
    }

    const durationMs = checkoutTime.getTime() - checkinTime.getTime();
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const rawFee = basePrice + durationHours * pricePerHour;

    if (maxDailyPrice > 0) {
      return Math.min(rawFee, maxDailyPrice);
    }

    return rawFee;
  }

  private getDurationMinutes(checkinTime: Date, checkoutTime: Date | null) {
    const end = checkoutTime ?? new Date();
    const durationMs = end.getTime() - checkinTime.getTime();
    return Math.max(Math.round(durationMs / (1000 * 60)), 0);
  }

  private generateLicensePlate(): string {
    const provinces = ['51', '59', '60', '61', '72'];
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const digits = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(
      10 + Math.random() * 90,
    )}`;

    return `${province}${letter}-${digits}`;
  }
}
