import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Role, SessionStatus, SlotStatus } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuestCardService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPricing = {
    basePrice: 3000,
    pricePerHour: 5000,
    maxDailyPrice: 30000,
  };

  /**
   * Tạo một thẻ RFID mới cho khách vãng lai
   */
  async createGuestCard(uid: string) {
    const existing = await this.prisma.rfidCard.findUnique({
      where: { uid },
    });

    if (existing) {
      throw new BadRequestException(`Thẻ RFID với UID '${uid}' đã tồn tại`);
    }

    const card = await this.prisma.rfidCard.create({
      data: {
        uid,
        status: 'ACTIVE',
        isGuestCard: true,
        userId: null,
      },
    });

    return {
      message: 'Tạo thẻ RFID khách vãng lai thành công',
      card: {
        id: card.id,
        uid: card.uid,
        status: card.status,
        isGuestCard: card.isGuestCard,
      },
    };
  }

  private generateRandomPlate(): string {
    // Generate random Vietnamese license plate: two letters + digits (e.g., 59A-12345)
    const provinceCodes = ['59', '51', '50', '41', '75', '79', '61', '60', '43', '62'];
    const letters = 'ABCDEFGHKLMNPRSTUVXYZ';
    const province = provinceCodes[Math.floor(Math.random() * provinceCodes.length)];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const digits = Math.floor(Math.random() * 90000) + 10000;
    return `${province}${letter}-${digits}`;
  }

  /**
   * Guest check-in: create a parking session. Fee is calculated on check-out.
   */
  async checkIn(uid: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Tìm thẻ guest
      const card = await tx.rfidCard.findUnique({
        where: { uid },
      });

      if (!card) {
        throw new NotFoundException(`Không tìm thấy thẻ RFID với UID '${uid}'`);
      }

      if (!card.isGuestCard) {
        throw new BadRequestException('Thẻ này không phải thẻ khách vãng lai');
      }

      if (card.status !== 'ACTIVE') {
        throw new BadRequestException('Thẻ RFID đang bị khóa');
      }

      // 2. Kiểm tra thẻ đang có session active không
      const activeSession = await tx.parkingSession.findFirst({
        where: {
          cardId: card.id,
          status: {
            in: [SessionStatus.INITIATED, SessionStatus.PARKING],
          },
        },
      });

      if (activeSession) {
        throw new BadRequestException('Thẻ này đang trong bãi, không thể check-in');
      }

      // 3. Tìm ô trống
      const emptySlot = await tx.parkingSlot.findFirst({
        where: {
          status: SlotStatus.EMPTY,
        },
        orderBy: [{ name: 'asc' }, { sensorCode: 'asc' }],
      });

      if (!emptySlot) {
        throw new BadRequestException('Bãi giữ xe đã đầy');
      }

      const checkinTime = new Date();

      // 5. Cập nhật ô đỗ
      await tx.parkingSlot.update({
        where: { id: emptySlot.id },
        data: {
          status: SlotStatus.OCCUPIED,
          lastUpdated: checkinTime,
        },
      });

      // 6. Cập nhật occupancy
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

      // 7. Tạo parking session với biển số ngẫu nhiên
      const licensePlateIn = this.generateRandomPlate();
      const session = await tx.parkingSession.create({
        data: {
          cardId: card.id,
          zoneId: emptySlot.zoneId,
          slotId: emptySlot.id,
          status: SessionStatus.PARKING,
          checkinTime,
          calculatedFee: 0,
          licensePlateIn,
        },
        include: {
          card: true,
          zone: true,
          slot: true,
        },
      });

      return {
        message: 'Guest check-in thành công',
        session: {
          id: session.id,
          status: session.status,
          checkinTime: session.checkinTime,
          licensePlateIn: session.licensePlateIn,
          slot: session.slot
            ? {
                id: session.slot.id,
                name: session.slot.name,
                sensorCode: session.slot.sensorCode,
              }
            : null,
          zone: session.zone
            ? {
                id: session.zone.id,
                code: session.zone.code,
                name: session.zone.name,
              }
            : null,
          card: {
            id: session.card.id,
            uid: session.card.uid,
            isGuestCard: session.card.isGuestCard,
          },
        },
      };
    });
  }

  /**
   * Guest check-out: tính phí, tạo payment CASH, đóng session
   */
  async checkOut(uid: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Tìm thẻ guest
      const card = await tx.rfidCard.findUnique({
        where: { uid },
      });

      if (!card) {
        throw new NotFoundException(`Không tìm thấy thẻ RFID với UID '${uid}'`);
      }

      if (!card.isGuestCard) {
        throw new BadRequestException('Thẻ này không phải thẻ khách vãng lai');
      }

      // 2. Tìm session đang active
      const activeSession = await tx.parkingSession.findFirst({
        where: {
          cardId: card.id,
          status: SessionStatus.PARKING,
        },
        include: {
          slot: true,
          zone: true,
        },
      });

      if (!activeSession) {
        throw new BadRequestException('Không tìm thấy session đang đỗ cho thẻ này');
      }

      const checkoutTime = new Date();
      const totalFee = await this.calculateFee(
        tx,
        Role.GUEST,
        activeSession.checkinTime,
        checkoutTime,
      );

      // 4. Tạo PaymentTransaction với CASH — tự động thanh toán thành công
      const paidAt = checkoutTime;
      const payment = await tx.paymentTransaction.create({
        data: {
          amount: totalFee,
          status: PaymentStatus.SUCCESS,
          method: PaymentMethod.CASH,
          userId: null,
          paidAt,
        },
      });

      // 5. Cập nhật session với biển số ra ngẫu nhiên
      const licensePlateOut = this.generateRandomPlate();
      const updatedSession = await tx.parkingSession.update({
        where: { id: activeSession.id },
        data: {
          status: SessionStatus.CLOSED,
          checkoutTime,
          licensePlateOut,
          calculatedFee: totalFee,
          paymentId: payment.id,
        },
        include: {
          card: true,
          zone: true,
          slot: true,
          payment: true,
        },
      });

      // 6. Giải phóng ô đỗ
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

      return {
        message: 'Guest check-out thành công. Vui lòng thanh toán tiền mặt.',
        session: {
          id: updatedSession.id,
          status: updatedSession.status,
          checkinTime: updatedSession.checkinTime,
          checkoutTime: updatedSession.checkoutTime,
          licensePlateIn: updatedSession.licensePlateIn,
          licensePlateOut: updatedSession.licensePlateOut,
          calculatedFee: updatedSession.calculatedFee,
          payment: updatedSession.payment
            ? {
                id: updatedSession.payment.id,
                amount: updatedSession.payment.amount,
                method: updatedSession.payment.method,
                status: updatedSession.payment.status,
              }
            : null,
          card: {
            id: updatedSession.card.id,
            uid: updatedSession.card.uid,
            isGuestCard: updatedSession.card.isGuestCard,
          },
          slot: activeSession.slot
            ? {
                id: activeSession.slot.id,
                name: activeSession.slot.name,
                sensorCode: activeSession.slot.sensorCode,
              }
            : null,
          zone: activeSession.zone
            ? {
                id: activeSession.zone.id,
                code: activeSession.zone.code,
                name: activeSession.zone.name,
              }
            : null,
        },
      };
    });
  }

  /**
   * Check-out tất cả xe Guest (isGuestCard = true) — CASH payment, auto SUCCESS
   */
  async checkoutAllGuests() {
    return this.checkoutAllByCardType(true, PaymentMethod.CASH, PaymentStatus.SUCCESS);
  }

  /**
   * Check-out tất cả xe User (isGuestCard = false) — QR payment, auto PENDING
   */
  async checkoutAllUsers() {
    return this.checkoutAllByCardType(false, PaymentMethod.BKPAY_QR, PaymentStatus.PENDING);
  }

  private async checkoutAllByCardType(
    isGuest: boolean,
    method: PaymentMethod,
    paymentStatus: PaymentStatus,
  ) {
    const activeSessions = await this.prisma.parkingSession.findMany({
      where: {
        status: SessionStatus.PARKING,
        card: {
          isGuestCard: isGuest,
        },
      },
      include: {
        card: {
          include: {
            user: true,
          },
        },
        slot: true,
        zone: true,
      },
    });

    if (activeSessions.length === 0) {
      const type = isGuest ? 'khách vãng lai' : 'người dùng';
      return {
        message: `Không có xe ${type} nào đang đỗ trong bãi.`,
        checkedOut: 0,
        sessions: [],
      };
    }

    const checkoutTime = new Date();
    const results: Array<{
      id: string;
      cardUid: string;
      status: string;
      checkinTime: Date;
      checkoutTime: Date;
      licensePlateIn: string | null;
      licensePlateOut: string;
      calculatedFee: number;
      paymentAmount: number;
      paymentMethod: string;
      paymentStatus: string;
    }> = [];

    for (const session of activeSessions) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const role = isGuest ? Role.GUEST : session.card.user?.role ?? Role.GUEST;
          const totalFee = await this.calculateFee(
            tx,
            role,
            session.checkinTime,
            checkoutTime,
          );

          // Tạo payment với method phù hợp
          // Nếu là SUCCESS (Guest) thì set paidAt, còn PENDING (User) thì để null
          const payment = await tx.paymentTransaction.create({
            data: {
              amount: totalFee,
              status: paymentStatus,
              method,
              userId: session.card.userId,
              paidAt: paymentStatus === PaymentStatus.SUCCESS ? checkoutTime : null,
            },
          });

          const licensePlateOut = this.generateRandomPlate();

          // Cập nhật session
          await tx.parkingSession.update({
            where: { id: session.id },
            data: {
              status: SessionStatus.CLOSED,
              checkoutTime,
              licensePlateOut,
              calculatedFee: totalFee,
              paymentId: payment.id,
            },
          });

          // Giải phóng ô đỗ
          if (session.slotId) {
            await tx.parkingSlot.update({
              where: { id: session.slotId },
              data: {
                status: SlotStatus.EMPTY,
                lastUpdated: checkoutTime,
              },
            });
          }

          if (session.zoneId) {
            const occupiedCount = await tx.parkingSlot.count({
              where: {
                zoneId: session.zoneId,
                status: SlotStatus.OCCUPIED,
              },
            });

            await tx.parkingZone.update({
              where: { id: session.zoneId },
              data: {
                currentOccupancy: occupiedCount,
              },
            });
          }

          results.push({
            id: session.id,
            cardUid: session.card.uid,
            status: 'CLOSED',
            checkinTime: session.checkinTime,
            checkoutTime,
            licensePlateIn: session.licensePlateIn,
            licensePlateOut,
            calculatedFee: totalFee,
            paymentAmount: totalFee,
            paymentMethod: method,
            paymentStatus: paymentStatus,
          });
        });
      } catch {
        // Skip failed sessions
      }
    }

    const typeLabel = isGuest ? 'khách vãng lai' : 'người dùng';
    return {
      message: `Đã check-out ${results.length}/${activeSessions.length} xe ${typeLabel} thành công.`,
      checkedOut: results.length,
      total: activeSessions.length,
      sessions: results,
    };
  }

  /**
   * Lấy danh sách tất cả guest cards
   */
  async getAllGuestCards() {
    const cards = await this.prisma.rfidCard.findMany({
      where: { isGuestCard: true },
      orderBy: { uid: 'asc' },
    });

    return cards.map((card) => ({
      id: card.id,
      uid: card.uid,
      status: card.status,
      isGuestCard: card.isGuestCard,
    }));
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
}
