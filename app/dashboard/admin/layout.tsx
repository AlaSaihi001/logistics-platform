import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Toaster } from "@/components/ui/use-toast";
import { AdminNavbar } from "@/components/admin-navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar  />
      <div className="flex flex-1">
        <div className="hidden md:block w-72">
          <AdminSidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
