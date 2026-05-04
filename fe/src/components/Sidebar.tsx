import React from "react";
import { useRole } from "../contexts/RoleContext";
import {
  LayoutDashboard,
  Car,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  FileText,
  ParkingSquare,
  LogOut,
  AlertTriangle,
} from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
};

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ["admin", "operator", "student", "guest"],
  },
  {
    id: "entry-exit",
    label: "Xe ra/vào",
    icon: <Car className="w-5 h-5" />,
    roles: ["admin", "operator"],
  },
  {
    id: "parking-slots",
    label: "Trạng thái ô đỗ",
    icon: <ParkingSquare className="w-5 h-5" />,
    roles: ["admin", "operator"],
  },
  // {
  //   id: "profile",
  //   label: "Thông tin cá nhân & thẻ",
  //   icon: <CreditCard className="w-5 h-5" />,
  //   roles: ["admin", "operator", "student", "guest"],
  // },
  {
    id: "payment",
    label: "Thanh toán",
    icon: <CreditCard className="w-5 h-5" />,
    roles: ["student"],
  },
  {
    id: "history",
    label: "Lịch sử giao dịch",
    icon: <FileText className="w-5 h-5" />,
    roles: ["admin", "operator", "student"],
  },
  {
    id: "reports",
    label: "Báo cáo thống kê",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["admin", "operator"],
  },
  // {
  //   id: "iot-alerts",
  //   label: "Quản lý sự cố IoT",
  //   icon: <AlertTriangle className="w-5 h-5" />,
  //   roles: ["admin", "operator"],
  // },
  {
    id: "permissions",
    label: "Phân quyền",
    icon: <Users className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: <Settings className="w-5 h-5" />,
    roles: ["admin"],
  },
];

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
};

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
}: SidebarProps) {
  const { userRole } = useRole();
  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10  rounded-lg flex items-center justify-center">
            <img src= "../hcmut.png" alt="Logo" />
          </div>
          <div>
            <h2 className="text-gray-900">HCMUT</h2>
            <p className="text-xs text-gray-500">Smart Parking</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
