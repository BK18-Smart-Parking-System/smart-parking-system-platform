'use client';
import { useState, useEffect } from "react";
import { parseJwt, useRole } from "../contexts/RoleContext";
import { LoginPage } from "../components/LoginPage";
import { Sidebar } from "../components/Sidebar";
import { Dashboard } from "../components/Dashboard";
import { EntryExit } from "../components/EntryExit";
import { ParkingSlots } from "../components/ParkingSlots";
import { Payment } from "../components/Payment";
import { History } from "../components/History";
import { Reports } from "../components/Reports";
import { Permissions } from "../components/Permissions";
import { Settings } from "../components/Settings";
import { setAccessToken, clearAccessToken } from "@/lib/token";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setUserRole } = useRole();
  const [activeTab, setActiveTab] = useState("dashboard");

  const clearRefreshToken = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // gửi cookie để xóa refresh token
      });
    } catch (err) {
      console.error("Đăng xuất thất bại", err);
    }
  };

  // Khi mở web, refresh lại token mới để giữ login
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include", // gửi cookie (refresh token)
          }
        );

        if (!res.ok) {
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        if (data.access_token) {
          setAccessToken(data.access_token);
          
          // decode role
          const decoded = parseJwt(data.access_token); 
          const payload = decoded || {};

          setUserRole(payload.role.toLowerCase() || "student");
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Khởi tạo xác thực thất bại", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("dashboard");

    // Xóa token
    clearAccessToken();
    clearRefreshToken();

    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem("fullName");
    localStorage.removeItem("universityId");
  };

  // Hiệu ứng load khi đang kiểm tra token
  if (isLoading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "entry-exit" && <EntryExit />}
          {activeTab === "parking-slots" && <ParkingSlots />}
          {activeTab === "payment" && <Payment />}
          {activeTab === "history" && <History />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "permissions" && <Permissions />}
          {activeTab === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}