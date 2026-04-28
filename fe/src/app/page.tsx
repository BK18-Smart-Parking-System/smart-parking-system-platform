'use client';
import { useState } from "react";
import { useRole } from "../contexts/RoleContext";
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

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setUserRole } = useRole();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("dashboard");
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("universityId");
  };

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
          {/* Mỗi tab là 1 component -> gọi api hay gì thì làm trong component đó */}
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