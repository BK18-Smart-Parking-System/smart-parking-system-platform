import { AlertTriangle, CheckCircle, Clock, CreditCard } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL,
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

type StudentPaymentInfo = {
  totalUnpaidSessions: number;
  totalAmount: number;
  lastPaymentDate: string | null;
  transactionHistory: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string | null;
    sessionsCount: number;
  }>;
};

type CreatePaymentResponse = {
  paymentId: string;
  orderCode: number;
  amount: number;
  checkoutUrl: string;
  qrCode?: string;
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let lastError: Error | null = null;

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        cache: "no-store",
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const payload = isJson ? await response.json() : null;

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String(payload.message)
            : "Yêu cầu thất bại.";
        throw new Error(message);
      }

      return payload as T;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Không thể kết nối API thanh toán.");
    }
  }

  throw lastError ?? new Error("Không thể kết nối API thanh toán.");
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} VNĐ`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function StudentPaymentView() {
  const [info, setInfo] = useState<StudentPaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identityQuery = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const user = localStorage.getItem("user");

    const userId = user ? JSON.parse(user).id : null;
    const universityId = user ? JSON.parse(user).universityId : null;

    const params = new URLSearchParams();

    if (userId) {
      params.set("userId", userId);
    } else if (universityId) {
      params.set("universityId", universityId);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }, []);

  const loadInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await requestJson<StudentPaymentInfo>(
        `/api/student/payment-info${identityQuery}`,
      );
      setInfo(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Không tải được dữ liệu thanh toán.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const syncAndLoad = async () => {
      try {
        await requestJson<{ message: string }>(
          `/api/student/sync-payment-status${identityQuery}`,
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );
      } catch {
        // Keep UI usable even when sync endpoint is temporarily unavailable.
      }

      await loadInfo();
    };

    void syncAndLoad();
  }, [identityQuery]);

  const onCreatePaymentLink = async () => {
    if (!info || info.totalAmount <= 0) {
      return;
    }

    setCreatingLink(true);
    setError(null);

    try {
      const data = await requestJson<CreatePaymentResponse>(
        `/api/student/create-payment-link${identityQuery}`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );
      window.location.href = data.checkoutUrl;
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Không tạo được link thanh toán.";
      setError(message);
      window.alert(message);
    } finally {
      setCreatingLink(false);
    }
  };

  const totalAmount = info?.totalAmount ?? 0;
  const statusLabel = totalAmount > 0 ? "Cần thanh toán" : "Đã thanh toán";
  const statusClass =
    totalAmount > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Thanh toán</h1>
        <p className="text-gray-600">Theo dõi công nợ và thực hiện thanh toán PayOS.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Thông tin thanh toán của bạn</h3>
        {loading ? (
          <p className="text-gray-500">Đang tải dữ liệu thanh toán...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng phí</p>
                  <p className="text-gray-900">{formatCurrency(totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số lượt chưa thanh toán</p>
                  <p className="text-gray-900">{info?.totalUnpaidSessions ?? 0}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusClass}`}
                  >
                    {totalAmount > 0 ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {statusLabel}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày thanh toán gần nhất</p>
                  <p className="text-gray-900">{formatDate(info?.lastPaymentDate ?? null)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => void onCreatePaymentLink()}
                disabled={totalAmount <= 0 || creatingLink}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  totalAmount > 0 && !creatingLink
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                {creatingLink ? "Đang tạo liên kết..." : "Thanh toán qua BKPay"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-6">Lịch sử thanh toán</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Ngày thanh toán</th>
                <th className="text-left py-3 px-4 text-gray-700">Số phiên</th>
                <th className="text-left py-3 px-4 text-gray-700">Phương thức</th>
                <th className="text-left py-3 px-4 text-gray-700">Số tiền</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(info?.transactionHistory.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                    Chưa có giao dịch thanh toán thành công.
                  </td>
                </tr>
              ) : (
                info?.transactionHistory.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{formatDate(tx.paidAt)}</td>
                    <td className="py-4 px-4 text-gray-600">{tx.sessionsCount}</td>
                    <td className="py-4 px-4 text-gray-600">{tx.method}</td>
                    <td className="py-4 px-4 text-gray-900">{formatCurrency(tx.amount)}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Đã thanh toán
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ManagementPaymentView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý thanh toán</h1>
        <p className="text-gray-600">Theo dõi tổng hợp trạng thái thanh toán hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-gray-900">--</p>
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
              <p className="text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cảnh báo</p>
              <p className="text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Payment() {
  const { userRole } = useRole();
  
  if (userRole === "student") {
    return <StudentPaymentView />;
  }

  return <ManagementPaymentView />;
}
