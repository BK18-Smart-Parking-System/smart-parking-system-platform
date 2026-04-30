import { Activity, Car, CheckCircle, ParkingSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const API_BASE_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

type OverviewResponse = {
  student: {
    id: string;
    fullName: string;
    universityId: string | null;
  };
  latestParking: {
    plate: string;
    checkinTime: string;
    checkoutTime: string | null;
    durationMinutes: number;
    status: string;
    location: string;
  } | null;
  monthlyStats: {
    totalSessions: number;
    totalEstimatedFee: number;
  };
  zoneStatus: Array<{
    id: string;
    code: string;
    name: string;
    capacity: number;
    currentOccupancy: number;
    availableSlots: number;
    occupancyRate: number;
  }>;
  weeklyChart: Array<{
    day: string;
    count: number;
  }>;
  recentHistory: Array<{
    id: string;
    status: string;
    checkinTime: string;
    checkoutTime: string | null;
    plateIn: string | null;
    plateOut: string | null;
    location: string;
  }>;
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
        error instanceof Error ? error : new Error("Không thể kết nối API sinh viên.");
    }
  }

  throw lastError ?? new Error("Không thể kết nối API sinh viên.");
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} VNĐ`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  return `${hours} giờ ${remain} phút`;
}

function mapSessionStatus(status: string) {
  switch (status) {
    case "PARKING":
      return "Đang đỗ";
    case "PAID":
      return "Đã thanh toán";
    case "PENDING_PAYMENT":
      return "Chờ thanh toán";
    case "CLOSED":
      return "Đã rời bãi";
    default:
      return status;
  }
}

export function StudentDashboard() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState({
    fullName: "Sinh viên",
    universityId: "N/A",
  });

  const identityQuery = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const userId = localStorage.getItem("userId");
    const universityId = localStorage.getItem("universityId");
    const params = new URLSearchParams();

    if (userId) {
      params.set("userId", userId);
    } else if (universityId) {
      params.set("universityId", universityId);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }, []);

  useEffect(() => {
    let ignore = false;

    requestJson<OverviewResponse>(`/api/student/overview${identityQuery}`)
      .then((data) => {
        if (ignore) {
          return;
        }

        setOverview(data);
        setError(null);
      })
      .catch((loadError) => {
        if (ignore) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "Không tải được tổng quan sinh viên.";
        setError(message);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [identityQuery]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setLocalProfile({
      fullName: localStorage.getItem("fullName") || "Sinh viên",
      universityId: localStorage.getItem("universityId") || "N/A",
    });
  }, []);

  const fullName = overview?.student.fullName || localProfile.fullName;
  const universityId = overview?.student.universityId || localProfile.universityId;
  const latestParking = overview?.latestParking;
  const monthlyStats = overview?.monthlyStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Xin chào, {fullName}</h1>
        <p className="text-gray-600">MSSV: {universityId}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Trạng thái xe</p>
          </div>
          <p className="text-gray-900 mb-1">
            {latestParking ? mapSessionStatus(latestParking.status) : "Chưa có dữ liệu"}
          </p>
          <p className="text-sm text-gray-600">{latestParking?.location ?? "Không xác định"}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Tổng phí tháng này</p>
          </div>
          <p className="text-gray-900 mb-1">
            {monthlyStats ? formatCurrency(monthlyStats.totalEstimatedFee) : "0 VNĐ"}
          </p>
          <p className="text-sm text-gray-600">Ước tính theo lịch sử gửi xe</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Lượt gửi xe tháng này</p>
          </div>
          <p className="text-gray-900 mb-1">{monthlyStats?.totalSessions ?? 0} lượt</p>
          <p className="text-sm text-gray-600">
            {monthlyStats && monthlyStats.totalSessions > 0
              ? `Trung bình ${(monthlyStats.totalSessions / 30).toFixed(1)} lượt/ngày`
              : "Chưa có lượt gửi xe"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Thông tin lần gửi xe gần nhất</h3>
        {loading ? (
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        ) : !latestParking ? (
          <p className="text-gray-500">Chưa có phiên gửi xe nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Biển số</p>
                <p className="text-gray-900">{latestParking.plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Thời điểm vào bãi</p>
                <p className="text-gray-900">{formatDateTime(latestParking.checkinTime)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Thời gian gửi</p>
                <p className="text-gray-900">{formatDuration(latestParking.durationMinutes)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Vị trí</p>
                <p className="text-gray-900">{latestParking.location}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Trạng thái bãi xe</h3>
          <div className="space-y-4">
            {(overview?.zoneStatus ?? []).map((zone) => (
              <div key={zone.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">{zone.name}</span>
                  <span
                    className={
                      zone.occupancyRate >= 90
                        ? "text-red-600"
                        : zone.occupancyRate >= 75
                          ? "text-orange-600"
                          : "text-green-600"
                    }
                  >
                    {zone.currentOccupancy}/{zone.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      zone.occupancyRate >= 90
                        ? "bg-red-500"
                        : zone.occupancyRate >= 75
                          ? "bg-orange-500"
                          : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(zone.occupancyRate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Lượt gửi xe tuần này</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={overview?.weeklyChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Số lượt" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Lịch sử gửi xe gần đây</h3>
        {loading ? (
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        ) : (overview?.recentHistory.length ?? 0) === 0 ? (
          <p className="text-gray-500">Chưa có lịch sử gửi xe.</p>
        ) : (
          <div className="space-y-3">
            {overview?.recentHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600 w-36">
                    {formatDateTime(item.checkinTime)}
                  </span>
                  <span className="text-sm text-gray-900">
                    {item.plateOut ?? item.plateIn ?? "Chưa nhận diện"}
                  </span>
                  <span className="text-sm text-gray-600">{item.location}</span>
                </div>
                <span className="text-sm text-blue-700">{mapSessionStatus(item.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <ParkingSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900">Mẹo sử dụng</p>
            <p className="text-sm text-blue-700 mt-1">
              Theo dõi trạng thái các khu vực trước khi vào bãi để chọn vị trí thuận tiện và giảm
              thời gian tìm chỗ đỗ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
