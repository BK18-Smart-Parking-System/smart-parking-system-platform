import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminDashboardDto,
  DailyActivityDto,
  DailyRevenueDto,
  DashboardStatsDto,
  ParkingZoneStatusDto,
  RecentTransactionDto,
  AlertDto,
  OperatorDashboardDto,
  StaffDashboardDto,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== HELPER METHODS ====================

  private getDayName(date: Date): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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

  private getMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  private getTodayRange() {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // ==================== STATISTICS ====================

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const { start: monthStart, end: monthEnd } = this.getMonthRange();
    const { start: prevMonthStart, end: prevMonthEnd } = this.getMonthRange();
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);

    const { start: todayStart, end: todayEnd } = this.getTodayRange();

    // Tổng doanh thu tháng này
    const thisMonthPayments = await this.prisma.paymentTransaction.findMany({
      where: {
        status: 'SUCCESS',
        paidAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const totalRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Tổng doanh thu tháng trước
    const prevMonthPayments = await this.prisma.paymentTransaction.findMany({
      where: {
        status: 'SUCCESS',
        paidAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    });

    const prevMonthRevenue = prevMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const revenueChangePercent = prevMonthRevenue > 0
      ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : 0;

    // Tổng người dùng
    const totalUsers = await this.prisma.user.count();

    // Người dùng mới tháng này
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Xe đang đỗ
    const activeSessions = await this.prisma.parkingSession.count({
      where: {
        status: {
          in: ['INITIATED', 'PARKING'],
        },
      },
    });

    // Tổng chỗ đỗ
    const totalSlots = await this.prisma.parkingSlot.count();

    // Lượt xe vào/ra hôm nay
    const todayEntriesSessions = await this.prisma.parkingSession.findMany({
      where: {
        checkinTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const todayExitsSessions = await this.prisma.parkingSession.findMany({
      where: {
        checkoutTime: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ['CLOSED', 'PAID'],
        },
      },
    });

    return {
      totalRevenue,
      revenueChangePercent: Math.round(revenueChangePercent * 100) / 100,
      totalUsers,
      newUsersThisMonth,
      currentOccupancy: activeSessions,
      totalCapacity: totalSlots,
      occupancyPercent: totalSlots > 0 ? Math.round((activeSessions / totalSlots) * 100) : 0,
      todayEntries: todayEntriesSessions.length,
      todayExits: todayExitsSessions.length,
    };
  }

  // ==================== WEEKLY ACTIVITY ====================

  async getWeeklyActivity(): Promise<DailyActivityDto[]> {
    const { start, end } = this.getDateRange(7);
    const result: DailyActivityDto[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const entries = await this.prisma.parkingSession.count({
        where: {
          checkinTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      const exits = await this.prisma.parkingSession.count({
        where: {
          checkoutTime: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: {
            in: ['CLOSED', 'PAID'],
          },
        },
      });

      result.push({
        date: this.formatDate(date),
        day: this.getDayName(date),
        entries,
        exits,
      });
    }

    return result;
  }

  // ==================== WEEKLY REVENUE ====================

  async getWeeklyRevenue(): Promise<DailyRevenueDto[]> {
    const result: DailyRevenueDto[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const payments = await this.prisma.paymentTransaction.findMany({
        where: {
          status: 'SUCCESS',
          paidAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      const amount = payments.reduce((sum, p) => sum + p.amount, 0);

      result.push({
        date: this.formatDate(date),
        day: this.getDayName(date),
        amount,
      });
    }

    return result;
  }

  // ==================== ZONE STATUS ====================

  async getZoneStatus(): Promise<ParkingZoneStatusDto[]> {
    const zones = await this.prisma.parkingZone.findMany({
      include: {
        slots: true,
      },
    });

    return zones.map((zone) => {
      const occupiedSlots = zone.slots.filter(s => s.status === 'OCCUPIED').length;
      const occupancyPercent = zone.capacity > 0
        ? Math.round((occupiedSlots / zone.capacity) * 100)
        : 0;

      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (occupancyPercent >= 95) status = 'critical';
      else if (occupancyPercent >= 80) status = 'warning';

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        currentOccupancy: occupiedSlots,
        capacity: zone.capacity,
        occupancyPercent,
        status,
      };
    });
  }

  // ==================== RECENT TRANSACTIONS ====================

  async getRecentTransactions(limit: number = 10): Promise<RecentTransactionDto[]> {
    const sessions = await this.prisma.parkingSession.findMany({
      take: limit,
      orderBy: {
        checkinTime: 'desc',
      },
      include: {
        card: {
          include: {
            user: true,
          },
        },
      },
    });

    return sessions.map((session) => {
      const licensePlate = session.licensePlateIn || 'Không xác định';
      const action = 'Vào';
      const userName = session.card.user?.fullName || 'Khách';

      return {
        id: session.id,
        time: this.formatTime(session.checkinTime),
        licensePlate,
        action,
        userName,
        status: 'success',
      };
    });
  }

  // ==================== ALERTS ====================

  async generateAlerts(): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];

    // Check for high occupancy zones
    const zoneStatus = await this.getZoneStatus();
    zoneStatus.forEach((zone) => {
      if (zone.status === 'critical') {
        alerts.push({
          id: `critical-occupancy-${zone.zoneId}`,
          type: 'critical',
          title: `${zone.zoneName} gần đầy (${zone.occupancyPercent}%)`,
          description: 'Cần điều phối người dùng đến khu vực khác',
          timestamp: new Date(),
        });
      } else if (zone.status === 'warning') {
        alerts.push({
          id: `warning-occupancy-${zone.zoneId}`,
          type: 'warning',
          title: `${zone.zoneName} đang tăng tải (${zone.occupancyPercent}%)`,
          description: 'Giám sát tình hình',
          timestamp: new Date(),
        });
      }
    });

    // Check for overdue payments
    const overduePayments = await this.prisma.paymentTransaction.count({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
    });

    if (overduePayments > 0) {
      alerts.push({
        id: 'overdue-payments',
        type: 'warning',
        title: `${overduePayments} khoản thanh toán quá hạn`,
        description: 'Cần gửi thông báo nhắc nhở',
        timestamp: new Date(),
      });
    }

    // Check for sensors needing maintenance
    const maintenanceSlots = await this.prisma.parkingSlot.count({
      where: {
        status: 'MAINTENANCE',
      },
    });

    if (maintenanceSlots > 0) {
      alerts.push({
        id: 'maintenance-slots',
        type: 'warning',
        title: `${maintenanceSlots} cảm biến cần bảo trì`,
        description: 'Kiểm tra và bảo dưỡng hạ tầng IoT',
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  // ==================== ADMIN DASHBOARD ====================

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const [stats, weekActivity, weekRevenue, zoneStatus, recentTransactions] =
      await Promise.all([
        this.getDashboardStats(),
        this.getWeeklyActivity(),
        this.getWeeklyRevenue(),
        this.getZoneStatus(),
        this.getRecentTransactions(10),
      ]);

    return {
      stats,
      weekActivity,
      weekRevenue,
      zoneStatus,
      recentTransactions,
    };
  }

  // ==================== OPERATOR/STAFF DASHBOARD ====================

  async getOperatorDashboard(): Promise<OperatorDashboardDto> {
    const stats = await this.getDashboardStats();
    const zoneStatus = await this.getZoneStatus();
    const recentTransactions = await this.getRecentTransactions(20);
    const alerts = await this.generateAlerts();

    // Calculate average parking duration (in hours)
    const sessionsWithDuration = await this.prisma.parkingSession.findMany({
      where: {
        checkoutTime: { not: null },
        status: { in: ['CLOSED', 'PAID'] },
      },
    });

    let averageParkingDuration = 0;
    if (sessionsWithDuration.length > 0) {
      const totalDuration = sessionsWithDuration.reduce((sum, session) => {
        const duration =
          (session.checkoutTime!.getTime() - session.checkinTime.getTime()) /
          (1000 * 60 * 60);
        return sum + duration;
      }, 0);
      averageParkingDuration = Math.round((totalDuration / sessionsWithDuration.length) * 10) / 10;
    }

    return {
      currentOccupancy: stats.currentOccupancy,
      totalCapacity: stats.totalCapacity,
      occupancyPercent: stats.occupancyPercent,
      todayEntries: stats.todayEntries,
      todayExits: stats.todayExits,
      averageParkingDuration,
      zoneStatus,
      recentTransactions,
      alerts,
    };
  }

  async getStaffDashboard(): Promise<StaffDashboardDto> {
    // Staff có quyền truy cập giống như operator
    return this.getOperatorDashboard();
  }
}
