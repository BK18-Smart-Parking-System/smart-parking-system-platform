import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ShieldAlert,
  Wrench,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:8081",
  "http://localhost:8080",
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

type SlotStatus = "EMPTY" | "OCCUPIED" | "UNKNOWN" | "MAINTENANCE";

type ParkingSlotRecord = {
  id: string;
  zoneId: string;
  name: string;
  sensorCode: string;
  status: SlotStatus;
  lastUpdated: string;
};

type ParkingZoneRecord = {
  id: string;
  code: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  slots: ParkingSlotRecord[];
};

type ParkingSessionRecord = {
  id: string;
  status: string;
  checkinTime: string;
  licensePlateIn: string | null;
  zone: {
    id: string;
    code: string;
    name: string;
  } | null;
  slot: {
    id: string;
    name: string;
    sensorCode: string;
    status: SlotStatus;
  } | null;
  rfidCard: {
    id: string;
    uid: string;
    user: {
      id: string;
      fullName: string;
      username: string;
    } | null;
  };
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
        error instanceof Error ? error : new Error("Không thể kết nối tới API bãi xe.");
    }
  }

  throw lastError ?? new Error("Không thể kết nối tới API bãi xe.");
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function getSlotLabel(slot: ParkingSlotRecord): string {
  return slot.name || slot.sensorCode;
}

function getSlotStatusLabel(status: SlotStatus): string {
  switch (status) {
    case "EMPTY":
      return "Trống";
    case "OCCUPIED":
      return "Đang có xe";
    case "MAINTENANCE":
      return "Niêm phong";
    default:
      return "Mất kết nối";
  }
}

export function ParkingSlots() {
  const [zones, setZones] = useState<ParkingZoneRecord[]>([]);
  const [activeSessions, setActiveSessions] = useState<ParkingSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sealingSlotId, setSealingSlotId] = useState<string | null>(null);

  const loadData = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const [zonesData, sessionsData] = await Promise.all([
        requestJson<ParkingZoneRecord[]>("/api/parking/zones-with-slots"),
        requestJson<ParkingSessionRecord[]>("/api/parking/sessions"),
      ]);

      setZones(zonesData);
      setActiveSessions(
        sessionsData.filter((session) => session.status === "PARKING"),
      );
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Không tải được dữ liệu ô đỗ.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleSeal = async (slot: ParkingSlotRecord) => {
    if (slot.status === "OCCUPIED") {
      window.alert("Không thể niêm phong ô đang có xe.");
      return;
    }

    setSealingSlotId(slot.id);

    try {
      await requestJson(`/api/parking-slot/${slot.id}/seal`, {
        method: "PATCH",
      });

      await loadData("refresh");
    } catch (toggleError) {
      const message =
        toggleError instanceof Error ? toggleError.message : "Không thể cập nhật trạng thái ô đỗ.";
      setError(message);
      window.alert(message);
    } finally {
      setSealingSlotId(null);
    }
  };

  useEffect(() => {
    let ignore = false;

    Promise.all([
      requestJson<ParkingZoneRecord[]>("/api/parking/zones-with-slots"),
      requestJson<ParkingSessionRecord[]>("/api/parking/sessions"),
    ])
      .then(([zonesData, sessionsData]) => {
        if (ignore) {
          return;
        }

        setZones(zonesData);
        setActiveSessions(
          sessionsData.filter((session) => session.status === "PARKING"),
        );
        setError(null);
      })
      .catch((loadError) => {
        if (ignore) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "Không tải được dữ liệu ô đỗ.";
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Trạng thái ô đỗ</h1>
          <p className="text-gray-600">
            Theo dõi trạng thái từng ô đỗ theo thời gian thực.
          </p>
        </div>
        <button
          onClick={() => void loadData("refresh")}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="md:col-span-2 xl:col-span-3 bg-white rounded-xl p-6 border border-gray-200 text-center text-gray-500">
            Đang tải dữ liệu khu vực và ô đỗ...
          </div>
        ) : zones.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 bg-white rounded-xl p-6 border border-gray-200 text-center text-gray-500">
            Không có khu vực bãi xe trong hệ thống.
          </div>
        ) : (
          zones.map((zone) => {
            const available = Math.max(zone.capacity - zone.currentOccupancy, 0);
            const percent =
              zone.capacity > 0
                ? Math.min((zone.currentOccupancy / zone.capacity) * 100, 100)
                : 0;

            return (
              <div key={zone.id} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-500">{zone.code}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {available}/{zone.capacity} trống
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đang đỗ:</span>
                    <span className="text-gray-900">
                      {zone.currentOccupancy}/{zone.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-900">{zone.name}</h3>
                <p className="text-sm text-gray-500">{zone.code}</p>
              </div>
              <span className="text-sm text-gray-500">
                {zone.currentOccupancy}/{zone.capacity}
              </span>
            </div>

            {zone.slots.length === 0 ? (
              <div className="text-sm text-gray-500">Khu vực này chưa có ô đỗ nào.</div>
            ) : (
              <div className="h-[180px] overflow-y-auto pr-1">
                <div className="grid grid-cols-5 gap-2">
                  {zone.slots.map((slot) => {
                    const isSealing = sealingSlotId === slot.id;
                    const colorClasses =
                      slot.status === "EMPTY"
                        ? "bg-green-50 border-green-300 text-green-700"
                        : slot.status === "OCCUPIED"
                          ? "bg-red-50 border-red-300 text-red-700"
                          : slot.status === "MAINTENANCE"
                            ? "bg-gray-200 border-gray-400 text-gray-700"
                            : "bg-gray-50 border-gray-300 text-gray-500";

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => void toggleSeal(slot)}
                        disabled={slot.status === "OCCUPIED" || isSealing}
                        className={`relative h-20 rounded-lg border-2 px-1 py-2 flex flex-col items-center justify-center gap-1 transition-all disabled:cursor-not-allowed ${colorClasses}`}
                        title={`${getSlotLabel(slot)} - ${getSlotStatusLabel(slot.status)}`}
                      >
                        <span className="text-[11px] leading-tight text-center">
                          {getSlotLabel(slot)}
                        </span>
                        <span className="text-[10px] leading-tight text-center">
                          {getSlotStatusLabel(slot.status)}
                        </span>
                        <div className="absolute top-1 right-1">
                          {slot.status === "EMPTY" && (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          )}
                          {slot.status === "OCCUPIED" && (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                          {slot.status === "MAINTENANCE" && (
                            <ShieldAlert className="w-3 h-3 text-gray-700" />
                          )}
                          {slot.status === "UNKNOWN" && (
                            <AlertCircle className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        {(slot.status === "EMPTY" || slot.status === "MAINTENANCE") && (
                          <div className="absolute bottom-1 right-1">
                            <Wrench className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Chi tiết ô đỗ đang sử dụng</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Khu vực</th>
                <th className="text-left py-3 px-4 text-gray-700">Ô đỗ</th>
                <th className="text-left py-3 px-4 text-gray-700">Biển số xe</th>
                <th className="text-left py-3 px-4 text-gray-700">Tên người đỗ</th>
                <th className="text-left py-3 px-4 text-gray-700">Giờ vào</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                    Đang tải dữ liệu xe đang đỗ...
                  </td>
                </tr>
              ) : activeSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                    Hiện không có xe nào đang đỗ.
                  </td>
                </tr>
              ) : (
                activeSessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">
                      {session.zone?.name ?? "Không xác định"}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {session.slot?.name ?? session.slot?.sensorCode ?? "Chưa gán"}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {session.licensePlateIn ?? "N/A"}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {session.rfidCard?.user?.fullName ?? "Không xác định"}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDateTime(session.checkinTime)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                        Đang đỗ
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
