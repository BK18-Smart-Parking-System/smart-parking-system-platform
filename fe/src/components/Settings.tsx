import { DollarSign, Save } from "lucide-react";
import { useState } from "react";

type PricePolicy = {
  id: string;
  userGroup: string;
  pricePerSession: number;
  pricePerHour: number;
  maxDailyPrice: number;
  billingCycle: string;
  effectiveDate: string;
};

const initialPolicies: PricePolicy[] = [
  {
    id: "1",
    userGroup: "Sinh viên",
    pricePerSession: 3000,
    pricePerHour: 5000,
    maxDailyPrice: 30000,
    billingCycle: "Hàng tháng",
    effectiveDate: "2026-01-01",
  },
  {
    id: "2",
    userGroup: "Giảng viên",
    pricePerSession: 0,
    pricePerHour: 0,
    maxDailyPrice: 0,
    billingCycle: "Miễn phí",
    effectiveDate: "2026-01-01",
  },
  {
    id: "3",
    userGroup: "Cán bộ",
    pricePerSession: 0,
    pricePerHour: 0,
    maxDailyPrice: 0,
    billingCycle: "Miễn phí",
    effectiveDate: "2026-01-01",
  },
  {
    id: "4",
    userGroup: "Khách vãng lai",
    pricePerSession: 5000,
    pricePerHour: 10000,
    maxDailyPrice: 50000,
    billingCycle: "Trả ngay",
    effectiveDate: "2026-01-01",
  },
];

export function Settings() {
  const [policies, setPolicies] = useState<PricePolicy[]>(initialPolicies);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string, field: keyof PricePolicy, value: string | number) => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.id === id ? { ...policy, [field]: value } : policy
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Cài đặt hệ thống</h1>
        <p className="text-gray-600">
          Quản lý cấu hình và chính sách giá cho hệ thống bãi xe
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Quản lý bảng giá</h3>
              <p className="text-sm text-gray-600">
                Thiết lập và cập nhật chính sách giá cho từng nhóm người dùng
              </p>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <Save className="w-5 h-5" />
            Lưu thay đổi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Nhóm người dùng</th>
                <th className="text-left py-3 px-4 text-gray-700">Giá/lượt</th>
                <th className="text-left py-3 px-4 text-gray-700">Giá/giờ</th>
                <th className="text-left py-3 px-4 text-gray-700">Tối đa/ngày</th>
                <th className="text-left py-3 px-4 text-gray-700">Chu kỳ</th>
                <th className="text-left py-3 px-4 text-gray-700">Hiệu lực</th>
                <th className="text-left py-3 px-4 text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => {
                const isEditing = editingId === policy.id;
                return (
                  <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{policy.userGroup}</td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={policy.pricePerSession}
                          onChange={(e) =>
                            handleEdit(policy.id, "pricePerSession", parseInt(e.target.value))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">
                          {policy.pricePerSession.toLocaleString()} VNĐ
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={policy.pricePerHour}
                          onChange={(e) =>
                            handleEdit(policy.id, "pricePerHour", parseInt(e.target.value))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">
                          {policy.pricePerHour.toLocaleString()} VNĐ
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={policy.maxDailyPrice}
                          onChange={(e) =>
                            handleEdit(policy.id, "maxDailyPrice", parseInt(e.target.value))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">
                          {policy.maxDailyPrice.toLocaleString()} VNĐ
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <select
                          value={policy.billingCycle}
                          onChange={(e) =>
                            handleEdit(policy.id, "billingCycle", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          <option>Hàng tháng</option>
                          <option>Trả ngay</option>
                          <option>Miễn phí</option>
                        </select>
                      ) : (
                        <span className="text-gray-900">{policy.billingCycle}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="date"
                          value={policy.effectiveDate}
                          onChange={(e) =>
                            handleEdit(policy.id, "effectiveDate", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-600">{policy.effectiveDate}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Xong
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(policy.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Cấu hình hệ thống</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Tên hệ thống
              </label>
              <input
                type="text"
                defaultValue="HCMUT Smart Parking"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email hỗ trợ
              </label>
              <input
                type="email"
                defaultValue="parking@hcmut.edu.vn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                defaultValue="028-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Tích hợp SSO</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">HCMUT_SSO</p>
                <p className="text-sm text-gray-600">Xác thực tập trung</p>
              </div>
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Kết nối
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">HCMUT_DATACORE</p>
                <p className="text-sm text-gray-600">Cơ sở dữ liệu</p>
              </div>
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Kết nối
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">BKPay API</p>
                <p className="text-sm text-gray-600">Thanh toán</p>
              </div>
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Kết nối
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex gap-3">
          <DollarSign className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900">Lưu ý về thay đổi chính sách giá</p>
            <p className="text-sm text-yellow-700 mt-1">
              Mọi thay đổi chính sách giá cần được xem xét kỹ lưỡng. Hệ thống sẽ tự động
              ghi log tất cả các thay đổi vào Audit Trail. Ngày hiệu lực không được trùng
              với chính sách hiện tại đang chạy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
