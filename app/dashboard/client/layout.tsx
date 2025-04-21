import type React from "react"
import { ClientNavbar } from "@/components/client-navbar"
import { ClientSidebar } from "@/components/client-sidebar"

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ClientNavbar />
      <div className="flex flex-1">
        <ClientSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
