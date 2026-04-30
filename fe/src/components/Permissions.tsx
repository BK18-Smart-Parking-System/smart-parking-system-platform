import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Shield, Mail, User, ShieldAlert } from "lucide-react";

type UserData = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

const ROLES = ["ADMIN", "OPERATOR", "STUDENT", "STAFF", "GUEST"];

export function Permissions() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách users
  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/users`);
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Thay đổi quyền
  const handleRoleChange = async (userId: string, newRole: string) => {
    const loadingToast = toast.loading("Đang cập nhật quyền...");
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      
      const res = await fetch(`${baseUrl}/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`, 
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi cập nhật");
      }

      toast.success("Cập nhật phân quyền thành công!", { id: loadingToast });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại!", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý Phân quyền</h1>
        <p className="text-gray-600">
          Chỉ định và quản lý vai trò của người dùng trong hệ thống
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 font-medium text-gray-700">Người dùng</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Quyền hiện tại</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{user.fullName || "Người dùng"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{user.email || "Chưa có email"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900 font-medium">{(user.role || "").toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none hover:border-blue-400 transition-colors"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Không tìm thấy dữ liệu người dùng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
