import { Shield, Check, X } from "lucide-react";
import { useState } from "react";

type UserGroup = {
  id: string;
  name: string;
  description: string;
  count: number;
};

type ParkingZone = {
  id: string;
  name: string;
  capacity: number;
  location: string;
};

const userGroups: UserGroup[] = [
  { id: "1", name: "Sinh viên", description: "Sinh viên đại học và cao học", count: 450 },
  { id: "2", name: "Giảng viên", description: "Giảng viên và nghiên cứu viên", count: 180 },
  { id: "3", name: "Cán bộ", description: "Nhân viên và cán bộ quản lý", count: 120 },
  { id: "4", name: "Khách", description: "Khách vãng lai", count: 50 },
];

const parkingZones: ParkingZone[] = [
  { id: "A", name: "Khu vực A", capacity: 100, location: "Gần cổng chính" },
  { id: "B", name: "Khu vực B", capacity: 150, location: "Khu giảng đường" },
  { id: "C", name: "Khu vực C", capacity: 150, location: "Khu ký túc xá" },
];

export function Permissions() {
  const [selectedGroup, setSelectedGroup] = useState<string>("1");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    "1": ["A", "C"],
    "2": ["A", "B"],
    "3": ["A", "B", "C"],
    "4": ["A"],
  });

  const togglePermission = (zone: string) => {
    setPermissions((prev) => {
      const current = prev[selectedGroup] || [];
      const updated = current.includes(zone)
        ? current.filter((z) => z !== zone)
        : [...current, zone];
      return { ...prev, [selectedGroup]: updated };
    });
  };

  const currentPermissions = permissions[selectedGroup] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý phân quyền</h1>
        <p className="text-gray-600">
          Thiết lập quyền truy cập bãi đỗ cho từng nhóm người dùng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-gray-900 mb-4">Nhóm người dùng</h3>
            <div className="space-y-2">
              {userGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedGroup === group.id
                      ? "bg-blue-50 border-2 border-blue-600"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedGroup === group.id ? "bg-blue-600" : "bg-gray-300"
                    }`}>
                      <Shield className={`w-5 h-5 ${
                        selectedGroup === group.id ? "text-white" : "text-gray-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-600">{group.count} người</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900">
                  Quyền truy cập: {userGroups.find(g => g.id === selectedGroup)?.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {userGroups.find(g => g.id === selectedGroup)?.description}
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Lưu thay đổi
              </button>
            </div>

            <div className="space-y-4">
              {parkingZones.map((zone) => {
                const hasAccess = currentPermissions.includes(zone.id);
                return (
                  <div
                    key={zone.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      hasAccess
                        ? "bg-green-50 border-green-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          hasAccess ? "bg-green-600" : "bg-gray-300"
                        }`}>
                          <span className="text-white">{zone.id}</span>
                        </div>
                        <div>
                          <p className="text-gray-900">{zone.name}</p>
                          <p className="text-sm text-gray-600">
                            {zone.capacity} chỗ - {zone.location}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePermission(zone.id)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          hasAccess
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      >
                        {hasAccess ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <X className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900">Lưu ý về phân quyền</p>
                <p className="text-sm text-blue-700 mt-1">
                  Người dùng chỉ có thể đỗ xe tại các khu vực được cấp quyền. Hệ thống sẽ
                  tự động kiểm tra quyền truy cập khi xe thực hiện vào bãi. Mọi thay đổi
                  cấu hình sẽ được ghi log để kiểm tra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Tổng quan phân quyền</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Nhóm người dùng</th>
                <th className="text-center py-3 px-4 text-gray-700">Khu A</th>
                <th className="text-center py-3 px-4 text-gray-700">Khu B</th>
                <th className="text-center py-3 px-4 text-gray-700">Khu C</th>
                <th className="text-center py-3 px-4 text-gray-700">Tổng quyền</th>
              </tr>
            </thead>
            <tbody>
              {userGroups.map((group) => {
                const groupPerms = permissions[group.id] || [];
                return (
                  <tr key={group.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{group.name}</td>
                    <td className="py-4 px-4 text-center">
                      {groupPerms.includes("A") ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {groupPerms.includes("B") ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {groupPerms.includes("C") ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-900">
                      {groupPerms.length} / 3
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
