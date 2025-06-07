import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardTab } from "@/components/dashboard/dashboard-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { UsersTab } from "@/components/dashboard/users-tab";
import { ApiTesterTab } from "@/components/dashboard/api-tester-tab";
import { SettingsTab } from "@/components/dashboard/settings-tab";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "profile":
        return <ProfileTab />;
      case "users":
        return <UsersTab />;
      case "api-tester":
        return <ApiTesterTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}