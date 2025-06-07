"use client"

import Link from "next/link"
import { Bell, Headset, Menu, MessageSquare, Search } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AssistantSidebar } from "@/components/assistant-sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
// Ajouter l'import pour ThemeToggle
import { ThemeToggle } from "@/components/theme-toggle"

export function AssistantNavbar() {
  const [notificationCount, setNotificationCount] = useState(8)
  const [supportCount, setSupportCount] = useState(3)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-[#3f1f5d] px-4 md:px-6 text-white">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#4f2f6d]">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r border-[#3f1f5d]/20">
            <AssistantSidebar />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard/assistant" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg">Assistant Portal</span>
        </Link>
      </div>

      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/dashboard/assistant" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg">Assistant Portal</span>
        </Link>
      </div>
    </header>
  )
}
