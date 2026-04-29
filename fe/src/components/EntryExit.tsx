import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL
].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

type ParkingSession = {
  id: string;
  status: string;
  checkinTime: string;
  checkoutTime: string | null;
  licensePlateIn: string | null;
  licensePlateOut: string | null;
  calculatedFee: number;
  rfidCard: {
    id: string;
    uid: string;
    status: string;
    user: {
      id: string;
      username: string;
      fullName: string;
      universityId: string | null;
      role: string;
    } | null;
  };
  zone: {
    id: string;
    code: string;
    name: string;
  } | null;
};

type SimulationResponse = {
  message: string;
  session: ParkingSession | null;
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
            : "Request failed.";
        throw new Error(message);
      }

      return payload as T;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unable to contact parking API.");
    }
  }

  throw lastError ?? new Error("Unable to contact parking API.");
}

function formatTime(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function getRecordType(session: ParkingSession): "entry" | "exit" {
  return session.status === "CLOSED" || Boolean(session.checkoutTime) ? "exit" : "entry";
}

function getDisplayPlate(session: ParkingSession): string {
  return session.licensePlateOut ?? session.licensePlateIn ?? "N/A";
}

function getStatusMeta(status: string) {
  switch (status) {
    case "CLOSED":
      return {
        label: "Đã rời bãi",
        className: "text-green-600",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case "PAID":
      return {
        label: "Đã thanh toán",
        className: "text-emerald-600",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    case "PENDING_PAYMENT":
      return {
        label: "Chờ thanh toán",
        className: "text-orange-600",
        icon: <Clock className="w-4 h-4" />,
      };
    case "PARKING":
      return {
        label: "Đang đỗ",
        className: "text-yellow-600",
        icon: <Clock className="w-4 h-4" />,
      };
    default:
      return {
        label: status,
        className: "text-red-600",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
  }
}

export function EntryExit() {
  const [filter, setFilter] = useState<"all" | "entry" | "exit">("all");
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<"check-in" | "check-out" | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await requestJson<ParkingSession[]>("/api/parking/sessions");
      setSessions(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load parking sessions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    requestJson<ParkingSession[]>("/api/parking/sessions")
      .then((data) => {
        if (ignore) {
          return;
        }

        setSessions(data);
        setError(null);
      })
      .catch((loadError) => {
        if (ignore) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "Unable to load parking sessions.";
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

  const runSimulation = async (
    action: "check-in" | "check-out",
    path: "/api/parking/simulate/random-check-in" | "/api/parking/simulate/random-check-out",
  ) => {
    setRunningAction(action);
    setError(null);

    try {
      const result = await requestJson<SimulationResponse>(path, {
        method: "POST",
      });

      await loadSessions();

      if (!result.session) {
        window.alert(result.message);
      }
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : "Unable to run demo action.";
      setError(message);

      if (action === "check-in") {
        window.alert(message);
      }
    } finally {
      setRunningAction(null);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") {
      return true;
    }

    return getRecordType(session) === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý xe ra/vào</h1>
        <p className="text-gray-600">
          Theo dõi và kiểm soát lượng xe ra/vào bãi đỗ.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-gray-900 mb-2">Mô phỏng dữ liệu</h3>
            <p className="text-sm text-gray-600">
              Chưa tích hợp camera phần cứng. Dùng các nút bên dưới để mô phỏng
              check-in/check-out ngẫu nhiên.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                runSimulation("check-in", "/api/parking/simulate/random-check-in")
              }
              disabled={runningAction !== null}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {runningAction === "check-in" ? "Đang chạy..." : "Demo Check-in"}
            </button>
            <button
              onClick={() =>
                runSimulation("check-out", "/api/parking/simulate/random-check-out")
              }
              disabled={runningAction !== null}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {runningAction === "check-out" ? "Đang chạy..." : "Demo Check-out"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("entry")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "entry"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Xe vào
            </button>
            <button
              onClick={() => setFilter("exit")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "exit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Xe ra
            </button>
          </div>
          <button
            onClick={() => void loadSessions()}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Làm mới
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
              <tr className="border-b border-gray-200">                <th className="text-left py-3 px-4 text-gray-700">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-700">Biển số xe</th>
                <th className="text-left py-3 px-4 text-gray-700">Card UID</th>
                <th className="text-left py-3 px-4 text-gray-700">Tên người dùng</th>
                <th className="text-left py-3 px-4 text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 text-gray-700">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                    Đang tải phiên gửi xe...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                    Không tìm thấy phiên gửi xe nào.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const statusMeta = getStatusMeta(session.status);

                  return (
                    <tr
                      key={session.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 text-gray-900">
                        {formatTime(session.checkoutTime ?? session.checkinTime)}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {getDisplayPlate(session)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {session.rfidCard?.uid ?? "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {session.rfidCard?.user?.fullName ?? "Không xác định"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`flex items-center gap-1 ${statusMeta.className}`}>
                          {statusMeta.icon}
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => {
                            const lines = [
                              `Biển số lúc vào: ${session.licensePlateIn ?? "N/A"}`,
                              `Biển số lúc ra: ${session.licensePlateOut ?? "N/A"}`,
                              `Khu vực: ${session.zone?.name ?? "N/A"}`,
                            ];
                            window.alert(lines.join("\n"));
                          }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="w-4 h-4" />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

