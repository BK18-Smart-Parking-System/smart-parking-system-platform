"use client";

import {
  BarChart3,
  Car,
  DollarSign,
  Users,
  ParkingSquare,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StudentDashboard } from "./StudentDashboard";
import { useRole } from "../contexts/RoleContext";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`);
        if (!response.ok) throw new Error("Failed to fetch admin dashboard");
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <p className="text-red-600">Lỗi: {error || "Không thể tải dữ liệu"}</p>
        </div>
      </div>
    );
  }

  const { stats, weekActivity, weekRevenue, zoneStatus, recentTransactions } = dashboardData;

  // Format revenue data for chart
  const chartWeekRevenue = weekRevenue.map((item: any) => ({
    ...item,
    amount: Math.round(item.amount / 1000), // Convert to thousands for display
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Dashboard quản trị toàn diện</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Doanh thu tháng</p>
          </div>
          <p className="text-gray-900 mb-1">
            {(stats.totalRevenue / 1_000_000).toFixed(1)}M VNĐ
          </p>
          <p className={`text-sm ${stats.revenueChangePercent >= 0 ? "text-green-600" : "text-red-600"} flex items-center gap-1`}>
            <TrendingUp className="w-4 h-4" />
            {stats.revenueChangePercent > 0 ? "+" : ""}{stats.revenueChangePercent}% so với tháng trước
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
          </div>
          <p className="text-gray-900 mb-1">{stats.totalUsers}</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +{stats.newUsersThisMonth} người dùng mới
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Xe đang đỗ</p>
          </div>
          <p className="text-gray-900 mb-1">
            {stats.currentOccupancy} / {stats.totalCapacity}
          </p>
          <p className="text-sm text-gray-600">Tỷ lệ lấp đầy: {stats.occupancyPercent}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt xe hôm nay</p>
          </div>
          <p className="text-gray-900 mb-1">{stats.todayEntries}</p>
          <p className="text-sm text-gray-600">Đã ra: {stats.todayExits} lượt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Doanh thu tuần này</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartWeekRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}k VNĐ`} />
              <Bar dataKey="amount" fill="#3b82f6" name="Doanh thu (1k VNĐ)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Lượt xe ra/vào tuần này</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weekActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="entries" stroke="#3b82f6" strokeWidth={2} name="Xe vào" />
              <Line type="monotone" dataKey="exits" stroke="#10b981" strokeWidth={2} name="Xe ra" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Trạng thái hạ tầng IoT</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-gray-900">Cảm biến</p>
                  <p className="text-sm text-gray-600">
                    {stats.totalCapacity} / {stats.totalCapacity} hoạt động
                  </p>
                </div>
              </div>
              <span className="text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-gray-900">Gateway</p>
                  <p className="text-sm text-gray-600">3 / 3 online</p>
                </div>
              </div>
              <span className="text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-gray-900">Camera AI</p>
                  <p className="text-sm text-gray-600">4 / 4 hoạt động</p>
                </div>
              </div>
              <span className="text-green-600">100%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Cảnh báo & Thông báo</h3>
          <div className="space-y-3">
            {zoneStatus
              .filter((zone: any) => zone.status !== "normal")
              .map((zone: any) => (
                <div
                  key={zone.zoneId}
                  className={`flex gap-3 p-3 rounded-lg ${
                    zone.status === "critical"
                      ? "bg-red-50"
                      : "bg-yellow-50"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      zone.status === "critical"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <div>
                    <p className="text-gray-900">
                      {zone.zoneName} ({zone.occupancyPercent}%)
                    </p>
                    <p className="text-sm text-gray-600">
                      {zone.currentOccupancy} / {zone.capacity} chỗ
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Tích hợp hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-900">HCMUT_SSO</p>
              <p className="text-sm text-gray-600">Xác thực tập trung</p>
            </div>
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-900">HCMUT_DATACORE</p>
              <p className="text-sm text-gray-600">Cơ sở dữ liệu</p>
            </div>
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-900">BKPay API</p>
              <p className="text-sm text-gray-600">Thanh toán</p>
            </div>
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OperatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/dashboard/operator`);
        if (!response.ok) throw new Error("Failed to fetch operator dashboard");
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <p className="text-red-600">Lỗi: {error || "Không thể tải dữ liệu"}</p>
        </div>
      </div>
    );
  }

  const {
    stats,
    zoneStatus = [],
    recentTransactions = [],
    alerts = [],
  } = dashboardData;

  const currentOccupancy = stats?.currentOccupancy || 0;
  const totalCapacity = stats?.totalCapacity || 0;
  const occupancyPercent = stats?.occupancyPercent || 0;
  const todayEntries = stats?.todayEntries || 0;
  const todayExits = stats?.todayExits || 0;
  const averageParkingDuration = stats?.averageParkingDuration || "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Tổng quan vận hành</h1>
        <p className="text-gray-600">Dashboard điều hành hoạt động bãi xe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Xe đang đỗ</p>
          </div>
          <p className="text-gray-900 mb-1">
            {currentOccupancy} / {totalCapacity}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${occupancyPercent}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt xe hôm nay</p>
          </div>
          <p className="text-gray-900 mb-1">
            {todayEntries} vào / {todayExits} ra
          </p>
          <p className="text-sm text-gray-600">
            Chênh lệch: {todayEntries - todayExits > 0 ? "+" : ""}{todayEntries - todayExits} xe
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Trung bình thời gian đỗ</p>
          </div>
          <p className="text-gray-900 mb-1">{averageParkingDuration} giờ</p>
          <p className="text-sm text-gray-600">Tuần này</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Trạng thái ô đỗ theo khu</h3>
        <div className="space-y-4">
          {zoneStatus.map((zone: any) => (
            <div key={zone.zoneId}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900">{zone.zoneName}</span>
                <span className="text-gray-600">
                  {zone.currentOccupancy} / {zone.capacity} ({zone.occupancyPercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    zone.status === "critical"
                      ? "bg-red-500"
                      : zone.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${zone.occupancyPercent}%` }}
                />
              </div>
              {zone.status === "critical" && (
                <p className="text-sm text-red-600 mt-1">⚠ Gần đầy - cần điều phối</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Hoạt động xe vào ra</h3>
          <p className="text-sm text-gray-600">Dữ liệu tuần này được cập nhật tự động</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Cảnh báo & Nhiệm vụ</h3>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert: any) => (
              <div
                key={alert.id}
                className={`flex gap-3 p-3 rounded-lg border-l-4 ${
                  alert.type === "critical"
                    ? "bg-red-50 border-red-500"
                    : alert.type === "warning"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.type === "critical"
                      ? "text-red-600"
                      : alert.type === "warning"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                />
                <div>
                  <p className="text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Giao dịch gần đây</h3>
        <div className="space-y-3">
          {recentTransactions.slice(0, 5).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-12">{item.time}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.action === "Vào"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.action}
                </span>
                <span className="text-gray-900">{item.licensePlate}</span>
                <span className="text-gray-600">{item.userName}</span>
              </div>
              {item.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { userRole } = useRole();

  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  if (userRole === "operator") {
    return <OperatorDashboard />;
  }

  return <StudentDashboard />;
}

