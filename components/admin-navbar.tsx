"use client"

import Link from "next/link"
import { Bell, Menu, Search, ShieldAlert, LogOut } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminNavbar() {
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(12)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", {
        method: "POST",
      })
      router.push("/auth/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-[#a22e2e] text-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
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

      <div className="ml-4 hidden flex-1 md:flex md:max-w-md lg:max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
          <Input
            type="search"
            placeholder="Rechercher un utilisateur, une commande..."
            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/70 pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle className="text-white hover:bg-white/10" />
        <Link href="/dashboard/admin/notifications">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className={cn(
                  "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs bg-white text-[#a22e2e]",
                )}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">admin@logitech.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin/profil">Mon profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin/parametres">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
