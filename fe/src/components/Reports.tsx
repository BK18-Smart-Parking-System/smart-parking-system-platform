"use client";

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Activity, Download } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/dashboard/reports/overview`);
        if (!response.ok) throw new Error("Failed to fetch reports");
        const reportData = await response.json();
        setData(reportData);
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
          <p className="text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <p className="text-red-600">Lỗi: {error || "Không thể tải báo cáo"}</p>
        </div>
      </div>
    );
  }

  const { monthlyRevenue, userDistribution, zoneUtilization, peakHours, paymentStatus, revenueSummary } = data;

  // Format revenue for pie chart (add colors)
  const userDataWithColors = userDistribution.map((user: any, idx: number) => ({
    ...user,
    color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][idx % 5],
  }));

  // Format peak hours for chart
  const peakHoursForChart = peakHours.map((hour: any) => ({
    hour: `${hour.hour}:00`,
    entries: hour.entries,
    exits: hour.exits,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Báo cáo thống kê</h1>
          <p className="text-gray-600">
            Phân tích dữ liệu và xu hướng hoạt động bãi xe
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
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
            {(revenueSummary.totalMonthly / 1_000_000).toFixed(1)}M VNĐ
          </p>
          <p className={`text-sm ${revenueSummary.changePercent >= 0 ? "text-green-600" : "text-red-600"} flex items-center gap-1`}>
            <TrendingUp className="w-4 h-4" />
            {revenueSummary.changePercent > 0 ? "+" : ""}{revenueSummary.changePercent}% so với tháng trước
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
          </div>
          <p className="text-gray-900 mb-1">
            {userDistribution.reduce((sum: number, u: any) => sum + u.value, 0)}
          </p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {userDistribution.length} loại người dùng
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Doanh thu trung bình/ngày</p>
          </div>
          <p className="text-gray-900 mb-1">
            {(revenueSummary.averageDaily / 1_000).toFixed(0)}k VNĐ
          </p>
          <p className="text-sm text-gray-600">Tháng này</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Doanh thu năm</p>
          </div>
          <p className="text-gray-900 mb-1">
            {(revenueSummary.totalYearly / 1_000_000).toFixed(0)}M VNĐ
          </p>
          <p className="text-sm text-gray-600">Ước tính</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Doanh thu 6 tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value as number / 1000).toFixed(0)}k VNĐ`} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Lượt xe ra/vào 6 tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="entries"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Xe vào"
              />
              <Line
                type="monotone"
                dataKey="exits"
                stroke="#10b981"
                strokeWidth={2}
                name="Xe ra"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Phân loại người dùng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDataWithColors}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDataWithColors.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {userDataWithColors.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Tỷ lệ sử dụng theo khu vực</h3>
          <div className="space-y-6 mt-8">
            {zoneUtilization.map((zone: any) => (
              <div key={zone.zoneId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">{zone.zoneName}</span>
                  <span className="text-gray-600">
                    {zone.usage}/{zone.capacity} ({zone.utilizationPercent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      zone.utilizationPercent >= 95
                        ? "bg-red-500"
                        : zone.utilizationPercent >= 80
                        ? "bg-yellow-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${zone.utilizationPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Giờ cao điểm (7 ngày gần đây)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursForChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entries" fill="#3b82f6" name="Xe vào" />
              <Bar dataKey="exits" fill="#10b981" name="Xe ra" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Trạng thái thanh toán</h3>
          <div className="space-y-4">
            {paymentStatus.map((status: any) => (
              <div key={status.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">
                    {status.status === "SUCCESS"
                      ? "Thành công"
                      : status.status === "PENDING"
                      ? "Đang chờ"
                      : status.status === "FAILED"
                      ? "Thất bại"
                      : "Quá hạn"}
                  </span>
                  <span className="text-gray-600">{status.count} ({status.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status.status === "SUCCESS"
                        ? "bg-green-600"
                        : status.status === "PENDING"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

