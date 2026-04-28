import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus, SessionStatus } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { ParkingHistoryQueryDto, StudentIdentityQueryDto } from './student-dashboard.dto';
import { PayosService } from './payos.service';

@Injectable()
export class StudentDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayosService,
  ) {}

  async getOverview(identity: StudentIdentityQueryDto) {
    const user = await this.resolveStudentUser(identity);
    const { startOfWeek, endOfWeek } = this.getCurrentWeekRange();
    const { startOfMonth, endOfMonth } = this.getCurrentMonthRange();

    const latestSession = await this.prisma.parkingSession.findFirst({
      where: {
        card: { userId: user.id },
      },
      include: {
        zone: true,
        slot: true,
      },
      orderBy: {
        checkinTime: 'desc',
      },
    });

    const monthlySessions = await this.prisma.parkingSession.findMany({
      where: {
        card: { userId: user.id },
        checkinTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        calculatedFee: true,
      },
    });

    const zones = await this.prisma.parkingZone.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        code: true,
        name: true,
        capacity: true,
        currentOccupancy: true,
      },
    });

    const weeklySessions = await this.prisma.parkingSession.findMany({
      where: {
        card: { userId: user.id },
        checkinTime: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      select: {
        checkinTime: true,
      },
    });

    const weeklyCount = [0, 0, 0, 0, 0, 0, 0];
    weeklySessions.forEach((session) => {
      const dayIndex = this.toMondayFirstIndex(session.checkinTime);
      weeklyCount[dayIndex] += 1;
    });

    const recentHistory = await this.prisma.parkingSession.findMany({
      where: {
        card: { userId: user.id },
      },
      include: {
        zone: true,
        slot: true,
      },
      orderBy: {
        checkinTime: 'desc',
      },
      take: 5,
    });

    const monthlyTotalFee = monthlySessions.reduce(
      (sum, session) => sum + Number(session.calculatedFee ?? 0),
      0,
    );

    return {
      student: {
        id: user.id,
        fullName: user.fullName,
        universityId: user.universityId,
      },
      latestParking: latestSession
        ? {
            plate:
              latestSession.licensePlateOut ??
              latestSession.licensePlateIn ??
              'Chưa nhận diện',
            checkinTime: latestSession.checkinTime,
            checkoutTime: latestSession.checkoutTime,
            durationMinutes: this.getDurationMinutes(
              latestSession.checkinTime,
              latestSession.checkoutTime,
            ),
            status: latestSession.status,
            location: this.buildLocationLabel(
              latestSession.zone?.name ?? null,
              latestSession.slot?.name ?? latestSession.slot?.sensorCode ?? null,
            ),
          }
        : null,
      monthlyStats: {
        totalSessions: monthlySessions.length,
        totalEstimatedFee: Math.round(monthlyTotalFee),
      },
      zoneStatus: zones.map((zone) => ({
        ...zone,
        availableSlots: Math.max(zone.capacity - zone.currentOccupancy, 0),
        occupancyRate:
          zone.capacity > 0
            ? Number(((zone.currentOccupancy / zone.capacity) * 100).toFixed(2))
            : 0,
      })),
      weeklyChart: [
        { day: 'T2', count: weeklyCount[0] },
        { day: 'T3', count: weeklyCount[1] },
        { day: 'T4', count: weeklyCount[2] },
        { day: 'T5', count: weeklyCount[3] },
        { day: 'T6', count: weeklyCount[4] },
        { day: 'T7', count: weeklyCount[5] },
        { day: 'CN', count: weeklyCount[6] },
      ],
      recentHistory: recentHistory.map((session) => ({
        id: session.id,
        status: session.status,
        checkinTime: session.checkinTime,
        checkoutTime: session.checkoutTime,
        plateIn: session.licensePlateIn,
        plateOut: session.licensePlateOut,
        zoneName: session.zone?.name ?? null,
        slotName: session.slot?.name ?? session.slot?.sensorCode ?? null,
        location: this.buildLocationLabel(
          session.zone?.name ?? null,
          session.slot?.name ?? session.slot?.sensorCode ?? null,
        ),
      })),
    };
  }

  async getPaymentInfo(identity: StudentIdentityQueryDto) {
    const user = await this.resolveStudentUser(identity);
    const sessions = await this.prisma.parkingSession.findMany({
      where: {
        card: { userId: user.id },
        checkoutTime: { not: null },
      },
      include: {
        payment: true,
      },
      orderBy: {
        checkinTime: 'desc',
      },
    });

    const unpaidSessions = sessions.filter(
      (session) =>
        Number(session.calculatedFee) > 0 &&
        (!session.payment || session.payment.status !== PaymentStatus.SUCCESS),
    );

    const successfulTransactions = await this.prisma.paymentTransaction.findMany({
      where: {
        userId: user.id,
        status: PaymentStatus.SUCCESS,
      },
      include: {
        sessions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    const totalAmount = unpaidSessions.reduce(
      (sum, session) => sum + Number(session.calculatedFee ?? 0),
      0,
    );

    const lastPaymentDate = successfulTransactions[0]?.paidAt ?? null;

    return {
      totalUnpaidSessions: unpaidSessions.length,
      totalAmount: Math.round(totalAmount),
      lastPaymentDate,
      transactionHistory: successfulTransactions.map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        method: transaction.method,
        status: transaction.status,
        paidAt: transaction.paidAt,
        sessionsCount: transaction.sessions.length,
      })),
    };
  }

  async createPaymentLink(identity: StudentIdentityQueryDto) {
    const user = await this.resolveStudentUser(identity);
    const sessions = await this.prisma.parkingSession.findMany({
      where: {
        card: { userId: user.id },
        checkoutTime: { not: null },
      },
      include: {
        payment: true,
      },
      orderBy: {
        checkinTime: 'desc',
      },
    });

    const unpaidSessions = sessions.filter(
      (session) =>
        Number(session.calculatedFee) > 0 &&
        (!session.payment || session.payment.status !== PaymentStatus.SUCCESS),
    );

    const totalAmount = Math.round(
      unpaidSessions.reduce((sum, session) => sum + Number(session.calculatedFee ?? 0), 0),
    );

    if (totalAmount <= 0 || unpaidSessions.length === 0) {
      throw new BadRequestException('Không có khoản phí cần thanh toán.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = process.env.PAYOS_RETURN_URL || `${frontendUrl}/payment?status=success`;
    const cancelUrl = process.env.PAYOS_CANCEL_URL || `${frontendUrl}/payment?status=cancel`;
    const orderCode = this.generateOrderCode();

    let checkoutUrl: string;
    let qrCode: string | undefined;

    try {
      const payosResult = await this.payosService.createPaymentLink({
        orderCode,
        amount: totalAmount,
        description: 'Phi gui xe HCMUT',
        returnUrl,
        cancelUrl,
      });

      checkoutUrl = payosResult.checkoutUrl;
      qrCode = payosResult.qrCode;
    } catch (error) {
      throw new InternalServerErrorException(
        `Không thể tạo liên kết thanh toán PayOS: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    const payment = await this.prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        amount: totalAmount,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.BKPAY_QR,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        qrCodeUrl: checkoutUrl,
      },
    });

    await this.prisma.parkingSession.updateMany({
      where: {
        id: {
          in: unpaidSessions.map((session) => session.id),
        },
      },
      data: {
        paymentId: payment.id,
        status: SessionStatus.PENDING_PAYMENT,
      },
    });

    return {
      paymentId: payment.id,
      orderCode,
      amount: totalAmount,
      checkoutUrl,
      qrCode,
    };
  }

  async getParkingHistory(query: ParkingHistoryQueryDto) {
    const user = await this.resolveStudentUser(query);
    const page = Math.max(Number(query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 100);
    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      card: { userId: user.id },
    };

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
          zone: true,
          slot: true,
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
        plate: session.licensePlateOut ?? session.licensePlateIn ?? 'Chưa nhận diện',
        checkinTime: session.checkinTime,
        checkoutTime: session.checkoutTime,
        durationMinutes: this.getDurationMinutes(
          session.checkinTime,
          session.checkoutTime,
        ),
        fee: Number(session.calculatedFee ?? 0),
        status: session.status,
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

  private async resolveStudentUser(identity: StudentIdentityQueryDto) {
    if (identity.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: identity.userId },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy sinh viên theo userId.');
      }
      return user;
    }

    if (identity.universityId) {
      const user = await this.prisma.user.findUnique({
        where: { universityId: identity.universityId },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy sinh viên theo MSSV.');
      }
      return user;
    }

    const fallbackUserId = process.env.STUDENT_DEMO_USER_ID;
    if (fallbackUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: fallbackUserId },
      });
      if (user) {
        return user;
      }
    }

    const firstStudent = await this.prisma.user.findFirst({
      where: {
        role: 'STUDENT',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!firstStudent) {
      throw new NotFoundException('Không có tài khoản sinh viên nào trong hệ thống.');
    }

    return firstStudent;
  }

  private getCurrentWeekRange() {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { startOfWeek: start, endOfWeek: end };
  }

  private getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth: start, endOfMonth: end };
  }

  private toMondayFirstIndex(dateValue: Date) {
    const day = dateValue.getDay();
    return day === 0 ? 6 : day - 1;
  }

  private getDurationMinutes(checkinTime: Date, checkoutTime: Date | null) {
    const end = checkoutTime ?? new Date();
    const durationMs = end.getTime() - checkinTime.getTime();
    return Math.max(Math.round(durationMs / (1000 * 60)), 0);
  }

  private buildLocationLabel(zoneName: string | null, slotName: string | null) {
    if (zoneName && slotName) {
      return `${zoneName} - Ô ${slotName}`;
    }
    if (zoneName) {
      return zoneName;
    }
    return 'Không xác định';
  }

  private generateOrderCode() {
    const now = Date.now().toString();
    const random = Math.floor(Math.random() * 90 + 10).toString();
    return Number(`${now.slice(-8)}${random}`);
  }
}
