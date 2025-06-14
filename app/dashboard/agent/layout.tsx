import type React from "react";
import { AgentSidebar } from "@/components/agent-sidebar";
import { AgentNavbar } from "@/components/agent-navbar";

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white to-[#074e6e]/5">
      <AgentNavbar />
      <div className="flex flex-1">
        {/* Cacher la sidebar sur les petits écrans */}
        <div className="hidden md:block">
          <AgentSidebar />
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
