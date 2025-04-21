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

      <div className="ml-4 hidden flex-1 md:flex md:max-w-md lg:max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3f1f5d]" />
          <Input
            type="search"
            placeholder="Rechercher une commande ou un client..."
            className="w-full bg-white/90 pl-8 md:w-[300px] lg:w-[400px] border-[#3f1f5d]/20 focus:border-[#3f1f5d] text-[#3f1f5d]"
          />
        </div>
      </div>

      {/* Modifier la section des boutons dans la div "ml-auto flex items-center gap-2" */}
      {/* Ajouter le ThemeToggle avant les autres boutons */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link href="/dashboard/assistant/support">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#4f2f6d]">
            <Headset className="h-5 w-5" />
            {supportCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8a4bdb] p-0 text-xs text-white",
                )}
              >
                {supportCount}
              </Badge>
            )}
            <span className="sr-only">Tickets de support</span>
          </Button>
        </Link>

        <Link href="/dashboard/assistant/notifications">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#4f2f6d]">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className={cn(
                  "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs",
                )}
              >
                {notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
