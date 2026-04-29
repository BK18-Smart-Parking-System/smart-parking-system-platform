import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Activity, Download } from "lucide-react";

const monthlyData = [
  { month: "T1", revenue: 42000, entries: 820, exits: 815 },
  { month: "T2", revenue: 38000, entries: 750, exits: 748 },
  { month: "T3", revenue: 45000, entries: 890, exits: 885 },
  { month: "T4", revenue: 48000, entries: 920, exits: 918 },
  { month: "T5", revenue: 52000, entries: 1050, exits: 1048 },
  { month: "T6", revenue: 47000, entries: 930, exits: 928 },
];

const userTypeData = [
  { name: "Sinh viên", value: 450, color: "#3b82f6" },
  { name: "Giảng viên", value: 180, color: "#10b981" },
  { name: "Cán bộ", value: 120, color: "#8b5cf6" },
  { name: "Khách", value: 50, color: "#f59e0b" },
];

const zoneUsage = [
  { zone: "Khu A", usage: 85, capacity: 100 },
  { zone: "Khu B", usage: 72, capacity: 150 },
  { zone: "Khu C", usage: 91, capacity: 150 },
];

export function Reports() {
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
          <p className="text-gray-900 mb-1">52.0M VNĐ</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +8.3% so với tháng trước
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
          </div>
          <p className="text-gray-900 mb-1">800</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +12 người dùng mới
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt xe tháng</p>
          </div>
          <p className="text-gray-900 mb-1">1,050</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +5.2% so với tháng trước
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Tỷ lệ lấp đầy TB</p>
          </div>
          <p className="text-gray-900 mb-1">82.3%</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +3.1% so với tháng trước
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Doanh thu 6 tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu (VNĐ)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Lượt xe ra/vào 6 tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {userTypeData.map((item) => (
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
            {zoneUsage.map((zone) => (
              <div key={zone.zone}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">{zone.zone}</span>
                  <span className="text-gray-600">
                    {zone.usage}/{zone.capacity} ({((zone.usage / zone.capacity) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(zone.usage / zone.capacity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Trạng thái hạ tầng IoT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Cảm biến hoạt động</p>
            <p className="text-gray-900">396 / 400</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "99%" }} />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Gateway online</p>
            <p className="text-gray-900">3 / 3</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Camera hoạt động</p>
            <p className="text-gray-900">4 / 4</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Bảng LED hoạt động</p>
            <p className="text-gray-900">2 / 2</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
