"use client";
import { DollarSign, Save } from "lucide-react";
import { useEffect, useState } from "react";

type Role = "STUDENT" | "STAFF" | "OPERATOR" | "GUEST" | "ADMIN";
type BillingCycle = "MONTHLY" | "PAY_NOW" | "FREE";

type Policy = {
  id: string;
  role: Role;
  basePrice: number;
  pricePerHour: number;
  maxDailyPrice: number;
  billingCycle: BillingCycle;
  effectiveFrom: string; // ISO string từ BE
  effectiveTo: string | null;
  createdAt: string;
};

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Sinh viên",
  STAFF: "Cán bộ / Giảng viên",
  OPERATOR: "Nhân viên vận hành",
  GUEST: "Khách vãng lai",
  ADMIN: "Quản trị viên",
};

const CYCLE_LABEL: Record<BillingCycle, string> = {
  MONTHLY: "Hàng tháng",
  PAY_NOW: "Trả ngay",
  FREE: "Miễn phí",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function Settings() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/settings/pricing-policies`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Policy[]) => {
        setPolicies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const handleEdit = (id: string, field: keyof Policy, value: string | number) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setDirty((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (dirty.size === 0) {
      alert("Không có thay đổi nào để lưu");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const toSave = policies.filter((p) => dirty.has(p.id));
      await Promise.all(
        toSave.map((p) =>
          fetch(`${API}/api/settings/pricing-policies/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              basePrice: p.basePrice,
              pricePerHour: p.pricePerHour,
              maxDailyPrice: p.maxDailyPrice,
              billingCycle: p.billingCycle,
              effectiveFrom: p.effectiveFrom.slice(0, 10),
            }),
          }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status} cho policy ${p.id}`);
            return r.json();
          })
        )
      );
      setDirty(new Set());
      alert(`Đã lưu ${toSave.length} thay đổi`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Cài đặt hệ thống</h1>
        <p className="text-gray-600">
          Quản lý cấu hình và chính sách giá cho hệ thống bãi xe
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

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
          <button
            onClick={handleSave}
            disabled={saving || dirty.size === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? "Đang lưu..." : `Lưu thay đổi${dirty.size > 0 ? ` (${dirty.size})` : ""}`}
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
                const dateStr = policy.effectiveFrom.slice(0, 10);
                return (
                  <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{ROLE_LABEL[policy.role]}</td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step={1000}
                          min={0}
                          value={policy.basePrice}
                          onChange={(e) =>
                            handleEdit(policy.id, "basePrice", parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">
                          {policy.basePrice.toLocaleString()} VNĐ
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step={1000}
                          min={0}
                          value={policy.pricePerHour}
                          onChange={(e) =>
                            handleEdit(policy.id, "pricePerHour", parseInt(e.target.value) || 0)
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
                          step={1000}
                          min={0}
                          value={policy.maxDailyPrice}
                          onChange={(e) =>
                            handleEdit(policy.id, "maxDailyPrice", parseInt(e.target.value) || 0)
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
                          <option value="MONTHLY">Hàng tháng</option>
                          <option value="PAY_NOW">Trả ngay</option>
                          <option value="FREE">Miễn phí</option>
                        </select>
                      ) : (
                        <span className="text-gray-900">{CYCLE_LABEL[policy.billingCycle]}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="date"
                          value={dateStr}
                          onChange={(e) =>
                            handleEdit(policy.id, "effectiveFrom", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-600">{dateStr}</span>
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
