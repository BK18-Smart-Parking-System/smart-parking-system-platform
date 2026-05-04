// Reports DTOs

export interface MonthlyReportData {
  month: string; // "T1", "T2", etc
  revenue: number;
  entries: number;
  exits: number;
  averageOccupancy: number;
}

export interface UserTypeData {
  name: string; // Role name (Sinh viên, Giảng viên, etc)
  value: number; // Count
  role: string; // STUDENT, STAFF, ADMIN, OPERATOR
}

export interface ZoneUsageData {
  zone: string;
  zoneName: string;
  usage: number; // Current occupancy
  capacity: number;
  utilizationPercent: number; // 0-100%
}

export interface PeakHourData {
  hour: number; // 0-23
  entries: number;
  exits: number;
}

export interface PaymentStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface DailyStatisticData {
  date: string; // YYYY-MM-DD
  day: string; // T2, T3, etc
  entries: number;
  exits: number;
  revenue: number;
  averageOccupancy: number;
  maxOccupancy: number;
}

export interface RevenueSummaryDto {
  totalMonthly: number;
  totalYearly: number;
  averageDaily: number;
  changePercent: number; // vs previous month
}

export interface ReportsOverviewDto {
  monthlyRevenue: MonthlyReportData[];
  userDistribution: UserTypeData[];
  zoneUtilization: ZoneUsageData[];
  peakHours: PeakHourData[];
  paymentStatus: PaymentStatusData[];
  revenueSummary: RevenueSummaryDto;
}

export interface DetailedReportsDto extends ReportsOverviewDto {
  dailyStats: DailyStatisticData[];
  topUsers: Array<{
    id: string;
    name: string;
    role: string;
    totalSessions: number;
    totalCost: number;
  }>;
  paymentDetails: Array<{
    id: string;
    userName: string;
    amount: number;
    status: string;
    paidAt?: string;
  }>;
}
