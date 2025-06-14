"use client"

import Link from "next/link"
import { Bell, Menu, Package, Search } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AgentSidebar } from "@/components/agent-sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function AgentNavbar() {
  const [notificationCount, setNotificationCount] = useState(5)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-[#074e6e] text-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#074e6e]/80">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <AgentSidebar />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard/agent" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg">Agent Portal</span>
        </Link>
      </div>

      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/dashboard/agent" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg">Agent Portal</span>
        </Link>
      </div>
    </header>
  )
}
