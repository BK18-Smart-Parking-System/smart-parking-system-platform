import { useState } from "react";
import { SquareParking } from "lucide-react";
import { parseJwt } from "../contexts/RoleContext";
import { setAccessToken } from "@/lib/token";

type LoginProps = {
  onBack: () => void;
  onLogin: (role: string) => void;
};

export function Login({ onBack, onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          credentials: "include", // để gửi cookie (refresh token)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!data.access_token) {
        alert("Đăng nhập thất bại!");
        return;
      }

      // lưu accessToken vào memory
      setAccessToken(data.access_token);
      // lưu user info vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // decode role
      const decoded = parseJwt(data.access_token);
      const resolvedRole = decoded?.role || data.user?.role || "STUDENT";

      switch (resolvedRole.toUpperCase()) {
        case "ADMIN":
          onLogin("admin");
          break;
        case "OPERATOR":
          onLogin("operator");
          break;
        case "GUEST":
          onLogin("guest");
          break;
        default:
          onLogin("student");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <SquareParking className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Hệ thống bãi xe thông minh</h1>
          <p className="text-gray-600">HCMUT Smart Parking System</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
        >
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg"
          >
            Đăng nhập
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-4 hover:underline hover:cursor-pointer hover:text-blue-600"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
