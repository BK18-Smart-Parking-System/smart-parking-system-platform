import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type ParkingSlot = {
  id: string;
  zone: string;
  number: string;
  status: "available" | "occupied" | "unknown";
  vehiclePlate?: string;
  entryTime?: string;
};

const mockSlots: ParkingSlot[] = [
  { id: "1", zone: "A", number: "A01", status: "occupied", vehiclePlate: "51F-12345", entryTime: "08:30" },
  { id: "2", zone: "A", number: "A02", status: "available" },
  { id: "3", zone: "A", number: "A03", status: "occupied", vehiclePlate: "59A-67890", entryTime: "09:15" },
  { id: "4", zone: "A", number: "A04", status: "available" },
  { id: "5", zone: "A", number: "A05", status: "occupied", vehiclePlate: "30H-11111", entryTime: "07:45" },
  { id: "6", zone: "A", number: "A06", status: "available" },
  { id: "7", zone: "A", number: "A07", status: "available" },
  { id: "8", zone: "A", number: "A08", status: "occupied", vehiclePlate: "51F-22222", entryTime: "08:00" },
  { id: "9", zone: "B", number: "B01", status: "available" },
  { id: "10", zone: "B", number: "B02", status: "occupied", vehiclePlate: "60B-33333", entryTime: "09:00" },
  { id: "11", zone: "B", number: "B03", status: "available" },
  { id: "12", zone: "B", number: "B04", status: "unknown" },
  { id: "13", zone: "B", number: "B05", status: "available" },
  { id: "14", zone: "B", number: "B06", status: "occupied", vehiclePlate: "51G-44444", entryTime: "08:15" },
  { id: "15", zone: "C", number: "C01", status: "available" },
  { id: "16", zone: "C", number: "C02", status: "available" },
  { id: "17", zone: "C", number: "C03", status: "occupied", vehiclePlate: "29A-55555", entryTime: "07:30" },
  { id: "18", zone: "C", number: "C04", status: "available" },
];

export function ParkingSlots() {
  const zones = ["A", "B", "C"];

  const getZoneStats = (zone: string) => {
    const zoneSlots = mockSlots.filter(slot => slot.zone === zone);
    const available = zoneSlots.filter(slot => slot.status === "available").length;
    const occupied = zoneSlots.filter(slot => slot.status === "occupied").length;
    const total = zoneSlots.length;
    return { available, occupied, total };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Trạng thái ô đỗ</h1>
        <p className="text-gray-600">
          Theo dõi tình trạng các ô đỗ xe theo thời gian thực
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map(zone => {
          const stats = getZoneStats(zone);
          return (
            <div key={zone} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Khu vực {zone}</h3>
                <span className="text-sm text-gray-500">
                  {stats.available}/{stats.total} trống
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đang đỗ:</span>
                  <span className="text-gray-900">{stats.occupied}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(stats.occupied / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {zones.map(zone => (
          <div key={zone} className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-gray-900 mb-4">Khu vực {zone}</h3>
            <div className="grid grid-cols-3 gap-2">
              {mockSlots
                .filter(slot => slot.zone === zone)
                .map(slot => (
                  <div
                    key={slot.id}
                    className={`relative aspect-square rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                      slot.status === "available"
                        ? "bg-green-50 border-green-300"
                        : slot.status === "occupied"
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-300"
                    }`}
                    title={
                      slot.status === "occupied"
                        ? `${slot.vehiclePlate} - ${slot.entryTime}`
                        : slot.status === "unknown"
                        ? "Cảm biến lỗi"
                        : "Chỗ trống"
                    }
                  >
                    <span className={`text-sm ${
                      slot.status === "available"
                        ? "text-green-700"
                        : slot.status === "occupied"
                        ? "text-red-700"
                        : "text-gray-500"
                    }`}>
                      {slot.number}
                    </span>
                    <div className="absolute top-1 right-1">
                      {slot.status === "available" && (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      )}
                      {slot.status === "occupied" && (
                        <XCircle className="w-3 h-3 text-red-600" />
                      )}
                      {slot.status === "unknown" && (
                        <AlertCircle className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Chi tiết ô đỗ đang sử dụng</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Vị trí</th>
                <th className="text-left py-3 px-4 text-gray-700">Biển số xe</th>
                <th className="text-left py-3 px-4 text-gray-700">Giờ vào</th>
                <th className="text-left py-3 px-4 text-gray-700">Thời gian đỗ</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockSlots
                .filter(slot => slot.status === "occupied")
                .map(slot => {
                  const entryHour = parseInt(slot.entryTime?.split(":")[0] || "0");
                  const duration = 9 - entryHour;
                  return (
                    <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900">{slot.number}</td>
                      <td className="py-4 px-4 text-gray-900">{slot.vehiclePlate}</td>
                      <td className="py-4 px-4 text-gray-600">{slot.entryTime}</td>
                      <td className="py-4 px-4 text-gray-600">{duration}h {Math.floor(Math.random() * 60)}m</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                          Đang đỗ
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Trạng thái cảm biến IoT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Gateway A", "Gateway B", "Gateway C", "Bảng LED chính"].map((device, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{device}</span>
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
