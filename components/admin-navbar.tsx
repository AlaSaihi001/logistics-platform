"use client";

import Link from "next/link";
import { Bell, Menu, Search, ShieldAlert, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminNavbar() {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(12);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", {
        method: "POST",
      });
      router.push("/auth/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-[#a22e2e] text-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5 text-black" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg">Admin Portal</span>
        </Link>
      </div>

      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg">Admin Portal</span>
        </Link>
      </div>
    </header>
  );
}
