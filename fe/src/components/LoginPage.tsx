import { LogIn, SquareParking } from "lucide-react";
import { Login } from "./Login";
import { Register } from "./Register";
import { useState } from "react";

export function LoginPage({ onLogin }: { onLogin: (role: string) => void }) {
  const [page, setPage] = useState("home");

  // Nếu đang ở trang login
  if (page === "login") {
    return (
      <Login
        onBack={() => setPage("home")}
        onLogin={ onLogin }
      />
    );
  }
  
  // Nếu đang ở trang register
  if (page === "register") {
    return <Register onBack={() => setPage("home")}/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <SquareParking className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Hệ thống Bãi Xe Thông Minh</h1>
          <p className="text-gray-600">HCMUT Smart Parking System</p>
        </div>

        <div className="space-y-4">
          {/* Đăng nhập */}
          <button
            onClick={() => setPage("login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Đăng nhập với HCMUT_SSO
          </button>
          {/* Đăng ký */}
          <button
            onClick={() => setPage("register")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Đăng ký tài khoản mới
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>Sử dụng tài khoản HCMUT để đăng nhập</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Demo: Nhấn nút đăng nhập để truy cập hệ thống
          </p>
          <div className="mt-4 space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>Quản trị viên</span>
              <button
                onClick={() => onLogin("admin")}
                className="text-blue-600 hover:underline"
              >
                Demo
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>Nhân viên vận hành</span>
              <button
                onClick={() => onLogin("operator")}
                className="text-blue-600 hover:underline"
              >
                Demo
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>Sinh viên</span>
              <button
                onClick={() => onLogin("student")}
                className="text-blue-600 hover:underline"
              >
                Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
