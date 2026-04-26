import { Camera, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

type EntryExitRecord = {
  id: string;
  time: string;
  plate: string;
  type: "entry" | "exit";
  cardId: string;
  userName: string;
  status: "success" | "pending" | "error";
  image?: string;
};

const mockRecords: EntryExitRecord[] = [
  {
    id: "1",
    time: "09:15:23",
    plate: "51F-12345",
    type: "entry",
    cardId: "1234567890",
    userName: "Nguyễn Văn A",
    status: "success",
  },
  {
    id: "2",
    time: "09:12:45",
    plate: "59A-67890",
    type: "exit",
    cardId: "0987654321",
    userName: "Trần Thị B",
    status: "success",
  },
  {
    id: "3",
    time: "09:08:12",
    plate: "30H-11111",
    type: "entry",
    cardId: "1111111111",
    userName: "Lê Văn C",
    status: "pending",
  },
  {
    id: "4",
    time: "09:05:34",
    plate: "51F-22222",
    type: "exit",
    cardId: "2222222222",
    userName: "Phạm Thị D",
    status: "success",
  },
  {
    id: "5",
    time: "09:02:56",
    plate: "Không đọc được",
    type: "entry",
    cardId: "3333333333",
    userName: "Hoàng Văn E",
    status: "error",
  },
];

export function EntryExit() {
  const [filter, setFilter] = useState<"all" | "entry" | "exit">("all");

  const filteredRecords = mockRecords.filter((record) => {
    if (filter === "all") return true;
    return record.type === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý xe ra/vào</h1>
        <p className="text-gray-600">
          Theo dõi và kiểm soát luồng xe ra vào bãi đỗ
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("entry")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "entry"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Xe vào
            </button>
            <button
              onClick={() => setFilter("exit")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "exit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Xe ra
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-700">Loại</th>
                <th className="text-left py-3 px-4 text-gray-700">Biển số xe</th>
                <th className="text-left py-3 px-4 text-gray-700">Mã thẻ</th>
                <th className="text-left py-3 px-4 text-gray-700">Người dùng</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 text-gray-700">Camera</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{record.time}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        record.type === "entry"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {record.type === "entry" ? "Vào" : "Ra"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{record.plate}</td>
                  <td className="py-4 px-4 text-gray-600">{record.cardId}</td>
                  <td className="py-4 px-4 text-gray-900">{record.userName}</td>
                  <td className="py-4 px-4">
                    {record.status === "success" && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Thành công
                      </span>
                    )}
                    {record.status === "pending" && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        Chờ xác minh
                      </span>
                    )}
                    {record.status === "error" && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        Lỗi OCR
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Camera className="w-4 h-4" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Camera Cổng Vào</h3>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Live Camera Feed</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Hoạt động
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Camera Cổng Ra</h3>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Live Camera Feed</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Hoạt động
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
