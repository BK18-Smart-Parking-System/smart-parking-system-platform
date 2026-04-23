import { Search, Calendar, Download, FileText } from "lucide-react";
import { useState } from "react";

type HistoryRecord = {
  id: string;
  date: string;
  time: string;
  vehiclePlate: string;
  cardId: string;
  userName: string;
  entryTime: string;
  exitTime: string;
  duration: string;
  amount: number;
  status: string;
};

const mockHistory: HistoryRecord[] = [
  {
    id: "1",
    date: "2026-03-30",
    time: "17:30",
    vehiclePlate: "51F-12345",
    cardId: "1234567890",
    userName: "Nguyễn Văn A",
    entryTime: "08:30",
    exitTime: "17:30",
    duration: "9h 0m",
    amount: 15000,
    status: "Đã thanh toán",
  },
  {
    id: "2",
    date: "2026-03-30",
    time: "16:45",
    vehiclePlate: "59A-67890",
    cardId: "0987654321",
    userName: "Trần Thị B",
    entryTime: "07:15",
    exitTime: "16:45",
    duration: "9h 30m",
    amount: 15000,
    status: "Đã thanh toán",
  },
  {
    id: "3",
    date: "2026-03-29",
    time: "18:00",
    vehiclePlate: "30H-11111",
    cardId: "1111111111",
    userName: "Lê Văn C",
    entryTime: "08:00",
    exitTime: "18:00",
    duration: "10h 0m",
    amount: 20000,
    status: "Đã thanh toán",
  },
  {
    id: "4",
    date: "2026-03-29",
    time: "15:30",
    vehiclePlate: "51F-22222",
    cardId: "2222222222",
    userName: "Phạm Thị D",
    entryTime: "09:00",
    exitTime: "15:30",
    duration: "6h 30m",
    amount: 10000,
    status: "Đã thanh toán",
  },
  {
    id: "5",
    date: "2026-03-28",
    time: "17:15",
    vehiclePlate: "60B-33333",
    cardId: "3333333333",
    userName: "Hoàng Văn E",
    entryTime: "08:15",
    exitTime: "17:15",
    duration: "9h 0m",
    amount: 15000,
    status: "Đã thanh toán",
  },
];

export function History() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = mockHistory.filter(
    (record) =>
      record.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cardId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Lịch sử giao dịch</h1>
        <p className="text-gray-600">
          Tra cứu và kiểm tra lịch sử các lượt xe ra/vào và thanh toán
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo biển số, tên, mã thẻ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Download className="w-5 h-5" />
            Xuất dữ liệu
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Ngày</th>
                <th className="text-left py-3 px-4 text-gray-700">Biển số</th>
                <th className="text-left py-3 px-4 text-gray-700">Người dùng</th>
                <th className="text-left py-3 px-4 text-gray-700">Giờ vào</th>
                <th className="text-left py-3 px-4 text-gray-700">Giờ ra</th>
                <th className="text-left py-3 px-4 text-gray-700">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-700">Phí</th>
                <th className="text-left py-3 px-4 text-gray-700">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{record.date}</td>
                  <td className="py-4 px-4 text-gray-900">{record.vehiclePlate}</td>
                  <td className="py-4 px-4 text-gray-900">{record.userName}</td>
                  <td className="py-4 px-4 text-gray-600">{record.entryTime}</td>
                  <td className="py-4 px-4 text-gray-600">{record.exitTime}</td>
                  <td className="py-4 px-4 text-gray-600">{record.duration}</td>
                  <td className="py-4 px-4 text-gray-900">
                    {record.amount.toLocaleString()} VNĐ
                  </td>
                  <td className="py-4 px-4">
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <FileText className="w-4 h-4" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy giao dịch nào</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Tổng quan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng số lượt</span>
              <span className="text-gray-900">5 lượt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng thời gian</span>
              <span className="text-gray-900">44h 0m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng phí</span>
              <span className="text-gray-900">75,000 VNĐ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Xu hướng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Thời gian đỗ trung bình</span>
              <span className="text-gray-900">8h 48m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phí trung bình/lượt</span>
              <span className="text-gray-900">15,000 VNĐ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Giờ vào phổ biến</span>
              <span className="text-gray-900">08:00 - 09:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
