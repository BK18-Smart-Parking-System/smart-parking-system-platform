'use client';
import { useState } from "react";
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
  const [userRole, setUserRole] = useState<string>("student");
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("dashboard");
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
        userRole={userRole}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === "dashboard" && <Dashboard userRole={userRole} />}
          {activeTab === "entry-exit" && <EntryExit />}
          {activeTab === "parking-slots" && <ParkingSlots />}
          {activeTab === "payment" && <Payment userRole={userRole} />}
          {activeTab === "history" && <History />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "permissions" && <Permissions />}
          {activeTab === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}