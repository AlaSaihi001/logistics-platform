"use client"

import Link from "next/link"
import { Bell, HelpCircle, Menu, Package } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ClientSidebar } from "@/components/client-sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// Ajouter l'import pour ThemeToggle
import { ThemeToggle } from "@/components/theme-toggle"

export function ClientNavbar() {
  const [notificationCount, setNotificationCount] = useState(3)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <ClientSidebar />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard/client" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Client Portal</span>
        </Link>
      </div>

      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/dashboard/client" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Client Portal</span>
        </Link>
      </div>

      {/* Modifier la section des boutons dans la div "ml-auto flex items-center gap-2" */}
      {/* Ajouter le ThemeToggle avant les autres boutons */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link href="/dashboard/client/notifications">
          <Button variant="ghost" size="icon" className="relative">
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

        <Link href="/dashboard/client/support">
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Support</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
