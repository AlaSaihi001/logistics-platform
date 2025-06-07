"use client";
import type React from "react";
import { ClientNavbar } from "@/components/client-navbar";
import { ClientSidebar } from "@/components/client-sidebar";
import ChatWidget from "@/components/ChatWidget"; // ← Add this

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ClientNavbar />
      <div className="flex flex-1">
        <ClientSidebar />
        <main className="flex-1 p-6 relative">{children}</main>
      </div>

      {/* Chat widget - floats in bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-50 w-[350px]">
        <ChatWidget />
      </div>
    </div>
  );
}
