import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReportsOverviewDto,
  DetailedReportsDto,
  MonthlyReportData,
  UserTypeData,
  ZoneUsageData,
  PeakHourData,
  PaymentStatusData,
  RevenueSummaryDto,
  DailyStatisticData,
} from './reports.dto';
import { Role } from '../../generated/prisma';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== HELPER METHODS ====================

  private getDayName(date: Date): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  }

  private getMonthName(date: Date): string {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months[date.getMonth()];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getMonthRange(monthsBack: number = 0) {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  private getDateRange(days: number) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // ==================== MONTHLY REVENUE ====================

  async getMonthlyRevenue(months: number = 6): Promise<MonthlyReportData[]> {
    const result: MonthlyReportData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const { start, end } = this.getMonthRange(i);

      // Revenue
      const payments = await this.prisma.paymentTransaction.findMany({
        where: {
          status: 'SUCCESS',
          paidAt: { gte: start, lte: end },
        },
      });
      const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

      // Entries/Exits
      const entries = await this.prisma.parkingSession.count({
        where: { checkinTime: { gte: start, lte: end } },
      });

      const exits = await this.prisma.parkingSession.count({
        where: {
          checkoutTime: { gte: start, lte: end },
          status: { in: ['CLOSED', 'PAID'] },
        },
      });

      // Average occupancy
      const sessions = await this.prisma.parkingSession.findMany({
        where: {
          checkinTime: { gte: start, lte: end },
        },
        select: { checkinTime: true, checkoutTime: true },
      });

      let averageOccupancy = 0;
      if (sessions.length > 0) {
        averageOccupancy = Math.round((sessions.length * 100) / 30); // Approximate
      }

      result.push({
        month: this.getMonthName(start),
        revenue,
        entries,
        exits,
        averageOccupancy,
      });
    }

    return result;
  }

  // ==================== USER DISTRIBUTION ====================

  async getUserDistribution(): Promise<UserTypeData[]> {
    const roles: Role[] = ['STUDENT', 'STAFF', 'ADMIN', 'OPERATOR'];
    const roleLabels: Record<Role, string> = {
      STUDENT: 'Sinh viên',
      STAFF: 'Cán bộ',
      ADMIN: 'Quản trị viên',
      OPERATOR: 'Nhân viên vận hành',
      GUEST: 'Khách',
    };

    const colorMap: Record<Role, string> = {
      STUDENT: '#3b82f6',
      STAFF: '#8b5cf6',
      ADMIN: '#ef4444',
      OPERATOR: '#10b981',
      GUEST: '#f59e0b',
    };

    const result: UserTypeData[] = [];

    for (const role of roles) {
      const count = await this.prisma.user.count({ where: { role } });
      if (count > 0) {
        result.push({
          name: roleLabels[role],
          value: count,
          role,
        });
      }
    }

    return result;
  }

  // ==================== ZONE UTILIZATION ====================

  async getZoneUtilization(): Promise<ZoneUsageData[]> {
    const zones = await this.prisma.parkingZone.findMany({
      include: { slots: true },
    });

    return zones.map((zone) => {
      const occupiedSlots = zone.slots.filter((s) => s.status === 'OCCUPIED').length;
      const utilizationPercent = zone.capacity > 0
        ? Math.round((occupiedSlots / zone.capacity) * 100)
        : 0;

      return {
        zone: `Khu ${zone.code}`,
        zoneName: zone.name,
        usage: occupiedSlots,
        capacity: zone.capacity,
        utilizationPercent,
      };
    });
  }

  // ==================== PEAK HOURS ====================

  async getPeakHours(): Promise<PeakHourData[]> {
    const result: PeakHourData[] = [];
    const { start, end } = this.getDateRange(7); // Last 7 days

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(start);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour, 59, 59, 999);

      const entries = await this.prisma.parkingSession.count({
        where: {
          checkinTime: {
            gte: new Date(hourStart.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            lte: new Date(hourEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          AND: [
            { checkinTime: { gte: new Date(hourStart.getTime() - hourStart.getHours() * 60 * 60 * 1000) } },
            { checkinTime: { lt: new Date((hourStart.getHours() + 1) * 60 * 60 * 1000) } },
          ],
        },
      });

      const exits = await this.prisma.parkingSession.count({
        where: {
          checkoutTime: {
            gte: new Date(hourStart.getTime() - 7 * 24 * 60 * 60 * 1000),
            lte: new Date(hourEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { in: ['CLOSED', 'PAID'] },
          AND: [
            { checkoutTime: { gte: new Date(hourStart.getTime() - hourStart.getHours() * 60 * 60 * 1000) } },
            { checkoutTime: { lt: new Date((hourStart.getHours() + 1) * 60 * 60 * 1000) } },
          ],
        },
      });

      result.push({
        hour,
        entries: Math.round(entries / 7), // Average per hour
        exits: Math.round(exits / 7),
      });
    }

    return result;
  }

  // ==================== PAYMENT STATUS ====================

  async getPaymentStatus(): Promise<PaymentStatusData[]> {
    const statuses: ('PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT')[] = ['PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT'];
    const total = await this.prisma.paymentTransaction.count();

    const result: PaymentStatusData[] = [];

    for (const status of statuses) {
      const count = await this.prisma.paymentTransaction.count({ where: { status } });
      result.push({
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      });
    }

    return result;
  }

  // ==================== REVENUE SUMMARY ====================

  async getRevenueSummary(): Promise<RevenueSummaryDto> {
    const { start: monthStart, end: monthEnd } = this.getMonthRange(0);
    const { start: prevMonthStart, end: prevMonthEnd } = this.getMonthRange(1);

    const thisMonthPayments = await this.prisma.paymentTransaction.findMany({
      where: { status: 'SUCCESS', paidAt: { gte: monthStart, lte: monthEnd } },
    });

    const prevMonthPayments = await this.prisma.paymentTransaction.findMany({
      where: { status: 'SUCCESS', paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    });

    const totalMonthly = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const prevMonthTotal = prevMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Estimate yearly (simplistic)
    const totalYearly = totalMonthly * 12;

    // Average daily
    const daysInMonth = new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 0).getDate();
    const averageDaily = Math.round(totalMonthly / daysInMonth);

    const changePercent = prevMonthTotal > 0
      ? ((totalMonthly - prevMonthTotal) / prevMonthTotal) * 100
      : 0;

    return {
      totalMonthly,
      totalYearly,
      averageDaily,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  }

  // ==================== DAILY STATISTICS ====================

  async getDailyStatistics(days: number = 30): Promise<DailyStatisticData[]> {
    const result: DailyStatisticData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const entries = await this.prisma.parkingSession.count({
        where: { checkinTime: { gte: date, lte: dayEnd } },
      });

      const exits = await this.prisma.parkingSession.count({
        where: {
          checkoutTime: { gte: date, lte: dayEnd },
          status: { in: ['CLOSED', 'PAID'] },
        },
      });

      const payments = await this.prisma.paymentTransaction.findMany({
        where: { status: 'SUCCESS', paidAt: { gte: date, lte: dayEnd } },
      });
      const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

      const activeSessions = await this.prisma.parkingSession.count({
        where: {
          checkinTime: { lte: dayEnd },
          checkoutTime: { gte: date },
        },
      });

      result.push({
        date: this.formatDate(date),
        day: this.getDayName(date),
        entries,
        exits,
        revenue,
        averageOccupancy: entries > 0 ? Math.round((activeSessions / entries) * 100) : 0,
        maxOccupancy: entries,
      });
    }

    return result;
  }

  // ==================== TOP USERS ====================

  async getTopUsers(limit: number = 10): Promise<
    Array<{
      id: string;
      name: string;
      role: string;
      totalSessions: number;
      totalCost: number;
    }>
  > {
    const users = await this.prisma.user.findMany({
      include: {
        cards: {
          include: {
            sessions: {
              include: { payment: true },
            },
          },
        },
      },
      take: limit,
    });

    return users
      .map((user) => {
        const sessions = user.cards.flatMap((card) => card.sessions);
        const totalCost = sessions.reduce((sum, session) => {
          return sum + (session.payment?.amount || session.calculatedFee || 0);
        }, 0);

        return {
          id: user.id,
          name: user.fullName,
          role: user.role,
          totalSessions: sessions.length,
          totalCost,
        };
      })
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, limit);
  }

  // ==================== PAYMENT DETAILS ====================

  async getPaymentDetails(limit: number = 50): Promise<
    Array<{
      id: string;
      userName: string;
      amount: number;
      status: string;
      paidAt?: string;
    }>
  > {
    const payments = await this.prisma.paymentTransaction.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return payments.map((payment) => ({
      id: payment.id,
      userName: payment.user?.fullName || 'Khách',
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt?.toISOString().split('T')[0],
    }));
  }

  // ==================== MAIN ENDPOINTS ====================

  async getReportsOverview(): Promise<ReportsOverviewDto> {
    const [monthlyRevenue, userDistribution, zoneUtilization, peakHours, paymentStatus, revenueSummary] =
      await Promise.all([
        this.getMonthlyRevenue(6),
        this.getUserDistribution(),
        this.getZoneUtilization(),
        this.getPeakHours(),
        this.getPaymentStatus(),
        this.getRevenueSummary(),
      ]);

    return {
      monthlyRevenue,
      userDistribution,
      zoneUtilization,
      peakHours,
      paymentStatus,
      revenueSummary,
    };
  }

  async getDetailedReports(): Promise<DetailedReportsDto> {
    const overview = await this.getReportsOverview();
    const [dailyStats, topUsers, paymentDetails] = await Promise.all([
      this.getDailyStatistics(30),
      this.getTopUsers(10),
      this.getPaymentDetails(50),
    ]);

    return {
      ...overview,
      dailyStats,
      topUsers,
      paymentDetails,
    };
  }
}
