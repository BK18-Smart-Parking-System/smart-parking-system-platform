export interface DashboardStatsDto {
  totalRevenue: number; // Tổng doanh thu tháng này
  revenueChangePercent: number; // Phần trăm thay đổi so với tháng trước
  totalUsers: number; // Tổng số người dùng
  newUsersThisMonth: number; // Người dùng mới tháng này
  currentOccupancy: number; // Số xe đang đỗ
  totalCapacity: number; // Tổng số chỗ
  occupancyPercent: number; // Tỷ lệ lấp đầy
  todayEntries: number; // Lượt xe vào hôm nay
  todayExits: number; // Lượt xe ra hôm nay
}

export interface DailyActivityDto {
  date: string; // Định dạng: YYYY-MM-DD
  day: string; // T2, T3, ..., CN
  entries: number;
  exits: number;
}

export interface DailyRevenueDto {
  date: string;
  day: string;
  amount: number;
}

export interface ParkingZoneStatusDto {
  zoneId: string;
  zoneName: string;
  currentOccupancy: number;
  capacity: number;
  occupancyPercent: number;
  status: 'normal' | 'warning' | 'critical'; // normal < 80%, warning 80-95%, critical >= 95%
}

export interface RecentTransactionDto {
  id: string;
  time: string; // Định dạng: HH:mm
  licensePlate: string;
  action: 'Vào' | 'Ra';
  userName: string;
  status: 'success' | 'warning' | 'error';
  reason?: string; // Giải thích nếu có lỗi
}

export interface AdminDashboardDto {
  stats: DashboardStatsDto;
  weekActivity: DailyActivityDto[]; // 7 ngày qua
  weekRevenue: DailyRevenueDto[]; // 7 ngày qua
  zoneStatus: ParkingZoneStatusDto[]; // Trạng thái tất cả các khu
  recentTransactions: RecentTransactionDto[]; // 10 giao dịch gần nhất
}

export interface OperatorDashboardDto {
  currentOccupancy: number;
  totalCapacity: number;
  occupancyPercent: number;
  todayEntries: number;
  todayExits: number;
  averageParkingDuration: number; // Giờ
  zoneStatus: ParkingZoneStatusDto[]; // Trạng thái tất cả các khu
  recentTransactions: RecentTransactionDto[]; // 20 giao dịch gần nhất
  alerts: AlertDto[];
}

export interface AlertDto {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
}

export interface StaffDashboardDto extends OperatorDashboardDto {
  // Có thể mở rộng để thêm các trường riêng cho staff sau
}
