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
import { StudentDashboardConnected } from "./StudentDashboard";

const weekData = [
  { day: "T2", entries: 145, exits: 142 },
  { day: "T3", entries: 158, exits: 155 },
  { day: "T4", entries: 162, exits: 160 },
  { day: "T5", entries: 178, exits: 175 },
  { day: "T6", entries: 192, exits: 190 },
  { day: "T7", entries: 134, exits: 132 },
  { day: "CN", entries: 98, exits: 96 },
];

const revenueData = [
  { day: "T2", amount: 8500 },
  { day: "T3", amount: 9200 },
  { day: "T4", amount: 9800 },
  { day: "T5", amount: 10500 },
  { day: "T6", amount: 11200 },
  { day: "T7", amount: 7800 },
  { day: "CN", amount: 5500 },
];

function AdminDashboard() {
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
              <Car className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Xe đang đỗ</p>
          </div>
          <p className="text-gray-900 mb-1">328 / 400</p>
          <p className="text-sm text-gray-600">Tỷ lệ lấp đầy: 82%</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt xe hôm nay</p>
          </div>
          <p className="text-gray-900 mb-1">192</p>
          <p className="text-sm text-gray-600">Đã ra: 187 lượt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Doanh thu tuần này</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" name="Doanh thu (VNĐ)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Lượt xe ra/vào tuần này</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weekData}>
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
                  <p className="text-sm text-gray-600">396 / 400 hoạt động</p>
                </div>
              </div>
              <span className="text-green-600">99%</span>
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
            <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">4 cảm biến cần bảo trì</p>
                <p className="text-sm text-gray-600">Khu C - Kiểm tra trong 24h</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">15 khoản thanh toán quá hạn</p>
                <p className="text-sm text-gray-600">Cần gửi thông báo nhắc nhở</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">Khu A gần đầy</p>
                <p className="text-sm text-gray-600">95% công suất - cần điều phối</p>
              </div>
            </div>
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
          <p className="text-gray-900 mb-1">328 / 400</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "82%" }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt xe hôm nay</p>
          </div>
          <p className="text-gray-900 mb-1">192 vào / 187 ra</p>
          <p className="text-sm text-gray-600">Chênh lệch: +5 xe</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Trung bình thời gian đỗ</p>
          </div>
          <p className="text-gray-900 mb-1">3.2 giờ</p>
          <p className="text-sm text-gray-600">Tuần này</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Trạng thái ô đỗ theo khu</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Khu A (Giảng viên)</span>
              <span className="text-gray-600">95 / 100 (95%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full" style={{ width: "95%" }} />
            </div>
            <p className="text-sm text-red-600 mt-1">⚠ Gần đầy - cần điều phối</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Khu B (Sinh viên 1)</span>
              <span className="text-gray-600">108 / 150 (72%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Khu C (Sinh viên 2)</span>
              <span className="text-gray-600">125 / 150 (83%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: "83%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Hoạt động xe vào ra</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="entries" stroke="#3b82f6" strokeWidth={2} name="Xe vào" />
              <Line type="monotone" dataKey="exits" stroke="#10b981" strokeWidth={2} name="Xe ra" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Cảnh báo & Nhiệm vụ</h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">Khu A gần đầy (95%)</p>
                <p className="text-sm text-gray-600">Hướng dẫn sinh viên đến Khu B</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">3 xe gửi quá 12 giờ</p>
                <p className="text-sm text-gray-600">Cần kiểm tra và liên hệ chủ xe</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900">4 cảm biến cần kiểm tra</p>
                <p className="text-sm text-gray-600">Khu C - vị trí C15, C24, C38, C42</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Giao dịch gần đây</h3>
        <div className="space-y-3">
          {[
            { time: "09:15", plate: "51F-12345", action: "Vào", user: "Nguyễn Văn A", status: "success" },
            { time: "09:12", plate: "59A-67890", action: "Ra", user: "Trần Thị B", status: "success" },
            { time: "09:08", plate: "Không đọc được", action: "Vào", user: "Lê Văn C", status: "warning" },
            { time: "09:05", plate: "51F-22222", action: "Ra", user: "Phạm Thị D", status: "success" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-12">{item.time}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.action === "Vào" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}>
                  {item.action}
                </span>
                <span className="text-gray-900">{item.plate}</span>
                <span className="text-gray-600">{item.user}</span>
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

function LegacyStudentDashboard() {
  const fullName = localStorage.getItem("fullName") || "Nguyễn Văn A";
  const universityId = localStorage.getItem("universityId") || "2011234";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Xin chào, {fullName}</h1>
        <p className="text-gray-600">MSSV: {universityId} - Khoa Khoa học & Kỹ thuật Máy tính</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Trạng thái xe</p>
          </div>
          <p className="text-gray-900 mb-1">Đang đỗ</p>
          <p className="text-sm text-gray-600">Khu B - Vị trí B24</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Thanh toán tháng này</p>
          </div>
          <p className="text-gray-900 mb-1">Đã thanh toán</p>
          <p className="text-sm text-gray-600">150,000 VNĐ</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt gửi xe tháng này</p>
          </div>
          <p className="text-gray-900 mb-1">42 lượt</p>
          <p className="text-sm text-gray-600">Trung bình 2.1 lượt/ngày</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Thông tin xe của bạn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Biển số xe</p>
              <p className="text-gray-900">51F-12345</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Loại xe</p>
              <p className="text-gray-900">Xe máy</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Mã thẻ RFID</p>
              <p className="text-gray-900">1234567890</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Thời gian vào gần nhất</p>
              <p className="text-gray-900">Hôm nay, 07:45</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Thời gian đỗ</p>
              <p className="text-gray-900">1 giờ 30 phút</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Vị trí đỗ</p>
              <p className="text-gray-900">Khu B - Ô đỗ B24</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Trạng thái bãi xe</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900">Khu A (Giảng viên)</span>
                <span className="text-red-600">Đầy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900">Khu B (Sinh viên 1)</span>
                <span className="text-green-600">Còn chỗ</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900">Khu C (Sinh viên 2)</span>
                <span className="text-orange-600">Sắp đầy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "83%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Lịch sử gửi xe tuần này</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entries" fill="#3b82f6" name="Số lượt" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Lịch sử giao dịch gần đây</h3>
        <div className="space-y-3">
          {[
            { date: "06/04/2026", time: "07:45", action: "Vào", location: "Khu B - B24" },
            { date: "05/04/2026", time: "17:30", action: "Ra", location: "Khu B - B24" },
            { date: "05/04/2026", time: "07:30", action: "Vào", location: "Khu B - B24" },
            { date: "04/04/2026", time: "18:00", action: "Ra", location: "Khu B - B15" },
            { date: "04/04/2026", time: "07:45", action: "Vào", location: "Khu B - B15" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-20">{item.date}</span>
                <span className="text-sm text-gray-600 w-16">{item.time}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.action === "Vào" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}>
                  {item.action}
                </span>
                <span className="text-gray-900">{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <ParkingSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900">Mẹo tiết kiệm</p>
            <p className="text-sm text-blue-700 mt-1">
              Bạn đã gửi xe 42 lượt tháng này. Nếu giảm xuống 40 lượt/tháng, bạn có thể tiết kiệm
              được khoảng 6,000 VNĐ. Hãy thử đi bộ hoặc xe bus cho những quãng đường ngắn!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ userRole }: { userRole: string }) {
  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  if (userRole === "operator") {
    return <OperatorDashboard />;
  }

  return <StudentDashboardConnected />;
}

