import { Calendar, Download, FileText, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRole } from "../contexts/RoleContext";

const API_BASE_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

type ParkingHistoryItem = {
  id: string;
  date: string;
  plate: string;
  checkinTime: string;
  checkoutTime: string | null;
  durationMinutes: number;
  fee: number;
  status: string;
  customerName?: string;
  customerRole?: string;
  cardUid?: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
};

type ParkingHistoryResponse = {
  items: ParkingHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalSessions: number;
    totalMinutes: number;
    totalFee: number;
    averageMinutes: number;
    averageFeePerSession: number;
  };
};

async function requestJson<T>(path: string): Promise<T> {
  let lastError: Error | null = null;

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        cache: "no-store",
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
        error instanceof Error ? error : new Error("Không thể kết nối API lịch sử gửi xe.");
    }
  }

  throw lastError ?? new Error("Không thể kết nối API lịch sử gửi xe.");
}

function mapTransactionStatus(item: ParkingHistoryItem) {
  if (item.paymentStatus === "SUCCESS" || item.status === "PAID") {
    return "Đã thanh toán";
  }

  if (
    item.paymentStatus === "PENDING" ||
    item.status === "PENDING_PAYMENT" ||
    item.status === "CLOSED" ||
    item.status === "PARKING"
  ) {
    return "Chờ thanh toán";
  }

  return "Lỗi thanh toán";
}

function normalizeVietnameseText(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} VNĐ`;
}

function formatCurrencyForPdf(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function History() {
  const { userRole } = useRole();
  const [plate, setPlate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [historyData, setHistoryData] = useState<ParkingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isManagementView = userRole === "admin" || userRole === "operator";

  const identityQuery = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;
    const universityId = user ? JSON.parse(user).universityId : null;
    const role = user ? JSON.parse(user).role : null;
    const params = new URLSearchParams();
    if (role === "STUDENT" || role === "STAFF") {
      if (userId) {
        params.set("userId", userId);
      } else if (universityId) {
        params.set("universityId", universityId);
      }
    }

    return params.toString();
  }, []);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams(identityQuery);
    params.set("page", String(page));
    params.set("pageSize", "10");

    if (plate.trim()) {
      params.set("plate", plate.trim());
    } else {
      params.delete("plate");
    }

    if (startDate) {
      params.set("startDate", startDate);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate);
    } else {
      params.delete("endDate");
    }

    return params.toString();
  }, [identityQuery, page, plate, startDate, endDate]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = buildQueryString();
      const endpoint = isManagementView
        ? "/api/parking/transaction-history"
        : "/api/student/parking-history";
      const data = await requestJson<ParkingHistoryResponse>(
        `${endpoint}?${query}`,
      );
      setHistoryData(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Không tải được lịch sử gửi xe.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, isManagementView]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const exportPdf = () => {
    const items = historyData?.items ?? [];
    if (items.length === 0) {
      window.alert("Không có dữ liệu để xuất PDF.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    const pdfText = (value: string | number | null | undefined) =>
      isManagementView ? normalizeVietnameseText(value) : String(value ?? "");
    doc.text(pdfText("Transaction history"), 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [
        (isManagementView
          ? ["Date", "Customer", "Card UID", "Plate", "Check-in", "Check-out", "Fee", "Status"]
          : ["Date", "Plate", "Check-in", "Check-out", "Duration", "Fee", "Status"]
        ).map(pdfText),
      ],
      body: items.map((item) => [
        ...(isManagementView
          ? [
              pdfText(formatDate(item.date)),
              pdfText(item.customerName ?? "N/A"),
              pdfText(item.cardUid ?? "N/A"),
              pdfText(item.plate),
              pdfText(formatDate(item.checkinTime)),
              pdfText(formatDate(item.checkoutTime)),
              pdfText(formatCurrencyForPdf(item.fee)),
              pdfText(mapTransactionStatus(item)),
            ]
          : [
              formatDate(item.date),
              item.plate,
              formatDate(item.checkinTime),
              formatDate(item.checkoutTime),
              formatDuration(item.durationMinutes),
              formatCurrency(item.fee),
              mapTransactionStatus(item),
            ]),
      ]),
      styles: {
        fontSize: 9,
      },
    });

    doc.save("transaction-history.pdf");
  };

  const summary = historyData?.summary;
  const pagination = historyData?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Transaction history</h1>
        <p className="text-gray-600">
          Tra cứu và kiểm tra lịch sử giao dịch.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo biển số..."
              value={plate}
              onChange={(event) => {
                setPlate(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={exportPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Xuất dữ liệu
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Ngày</th>
                {isManagementView && (
                  <>
                    <th className="text-left py-3 px-4 text-gray-700">Khách hàng</th>
                    <th className="text-left py-3 px-4 text-gray-700">Card UID</th>
                  </>
                )}
                <th className="text-left py-3 px-4 text-gray-700">Biển số</th>
                <th className="text-left py-3 px-4 text-gray-700">Giờ vào</th>
                <th className="text-left py-3 px-4 text-gray-700">Giờ ra</th>
                <th className="text-left py-3 px-4 text-gray-700">Thời gian gửi</th>
                <th className="text-left py-3 px-4 text-gray-700">Phí</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isManagementView ? 9 : 7} className="py-6 px-4 text-center text-gray-500">
                    Đang tải transaction history...
                  </td>
                </tr>
              ) : (historyData?.items.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={isManagementView ? 9 : 7} className="py-6 px-4 text-center text-gray-500">
                    Không tìm thấy transaction history phù hợp.
                  </td>
                </tr>
              ) : (
                historyData?.items.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{formatDate(record.date)}</td>
                    {isManagementView && (
                      <>
                        <td className="py-4 px-4 text-gray-900">
                          {record.customerName ?? "N/A"}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {record.cardUid ?? "N/A"}
                        </td>
                      </>
                    )}
                    <td className="py-4 px-4 text-gray-900">{record.plate}</td>
                    <td className="py-4 px-4 text-gray-600">{formatDate(record.checkinTime)}</td>
                    <td className="py-4 px-4 text-gray-600">{formatDate(record.checkoutTime)}</td>
                    <td className="py-4 px-4 text-gray-600">{formatDuration(record.durationMinutes)}</td>
                    <td className="py-4 px-4 text-gray-900">{formatCurrency(record.fee)}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {mapTransactionStatus(record)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Trang {pagination.page}/{pagination.totalPages} - {pagination.totalItems} bản ghi
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                }
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {(historyData?.items.length ?? 0) === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy dữ liệu transaction history.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Tổng quan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng số lượt</span>
              <span className="text-gray-900">{summary?.totalSessions ?? 0} lượt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng thời gian</span>
              <span className="text-gray-900">{formatDuration(summary?.totalMinutes ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng phí</span>
              <span className="text-gray-900">{formatCurrency(summary?.totalFee ?? 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Xu hướng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Thời gian gửi trung bình</span>
              <span className="text-gray-900">
                {formatDuration(summary?.averageMinutes ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phí trung bình/lượt</span>
              <span className="text-gray-900">
                {formatCurrency(summary?.averageFeePerSession ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Bản ghi đang hiển thị</span>
              <span className="text-gray-900">{historyData?.items.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
