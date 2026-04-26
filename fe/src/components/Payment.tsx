import { CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useRole } from "../contexts/RoleContext";

type Payment = {
  id: string;
  date: string;
  userName: string;
  vehiclePlate: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  period: string;
  sessions: number;
};

const mockPayments: Payment[] = [
  {
    id: "1",
    date: "2026-03-30",
    userName: "Nguyễn Văn A",
    vehiclePlate: "51F-12345",
    amount: 150000,
    status: "paid",
    period: "Tháng 3",
    sessions: 42,
  },
  {
    id: "2",
    date: "2026-03-28",
    userName: "Trần Thị B",
    vehiclePlate: "59A-67890",
    amount: 120000,
    status: "paid",
    period: "Tháng 3",
    sessions: 35,
  },
  {
    id: "3",
    date: "2026-03-31",
    userName: "Lê Văn C",
    vehiclePlate: "30H-11111",
    amount: 180000,
    status: "pending",
    period: "Tháng 3",
    sessions: 48,
  },
  {
    id: "4",
    date: "2026-02-28",
    userName: "Phạm Thị D",
    vehiclePlate: "51F-22222",
    amount: 90000,
    status: "overdue",
    period: "Tháng 2",
    sessions: 28,
  },
  {
    id: "5",
    date: "2026-03-29",
    userName: "Hoàng Văn E",
    vehiclePlate: "60B-33333",
    amount: 200000,
    status: "paid",
    period: "Tháng 3",
    sessions: 55,
  },
];

export function Payment() {
  const { userRole } = useRole();

  const totalRevenue = mockPayments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = mockPayments
    .filter(p => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý thanh toán</h1>
        <p className="text-gray-600">
          Theo dõi và quản lý các khoản thanh toán phí gửi xe
        </p>
      </div>

      {userRole !== "student" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã thanh toán</p>
                <p className="text-gray-900">{totalRevenue.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chờ thanh toán</p>
                <p className="text-gray-900">{pendingAmount.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quá hạn</p>
                <p className="text-gray-900">{overdueAmount.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {userRole === "student" && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Thông tin thanh toán của bạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng phí tháng này</p>
              <p className="text-gray-900 mb-4">150,000 VNĐ</p>
              <p className="text-sm text-gray-600 mb-1">Số lượt gửi xe</p>
              <p className="text-gray-900">42 lượt</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 mb-4">
                <CheckCircle className="w-4 h-4" />
                Đã thanh toán
              </span>
              <p className="text-sm text-gray-600 mb-1">Ngày thanh toán</p>
              <p className="text-gray-900">30/03/2026</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <CreditCard className="w-5 h-5" />
              Thanh toán qua BKPay
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">Danh sách giao dịch</h3>
          {userRole !== "student" && (
            <button className="text-blue-600 hover:text-blue-700">
              Xuất báo cáo
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Ngày</th>
                <th className="text-left py-3 px-4 text-gray-700">Người dùng</th>
                <th className="text-left py-3 px-4 text-gray-700">Biển số</th>
                <th className="text-left py-3 px-4 text-gray-700">Kỳ</th>
                <th className="text-left py-3 px-4 text-gray-700">Số lượt</th>
                <th className="text-left py-3 px-4 text-gray-700">Số tiền</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{payment.date}</td>
                  <td className="py-4 px-4 text-gray-900">{payment.userName}</td>
                  <td className="py-4 px-4 text-gray-900">{payment.vehiclePlate}</td>
                  <td className="py-4 px-4 text-gray-600">{payment.period}</td>
                  <td className="py-4 px-4 text-gray-600">{payment.sessions}</td>
                  <td className="py-4 px-4 text-gray-900">
                    {payment.amount.toLocaleString()} VNĐ
                  </td>
                  <td className="py-4 px-4">
                    {payment.status === "paid" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Đã thanh toán
                      </span>
                    )}
                    {payment.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                        <Clock className="w-4 h-4" />
                        Chờ thanh toán
                      </span>
                    )}
                    {payment.status === "overdue" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        Quá hạn
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userRole === "admin" && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Tích hợp BKPay</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Trạng thái kết nối</p>
                <p className="text-sm text-gray-600">API BKPay</p>
              </div>
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Hoạt động
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Đồng bộ giao dịch</p>
                <p className="text-sm text-gray-600">Webhook</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                Kiểm tra đối soát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
