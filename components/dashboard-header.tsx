"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AgentSidebar } from "@/components/agent-sidebar"
import { AssistantSidebar } from "@/components/assistant-sidebar"
import { ClientSidebar } from "@/components/client-sidebar"
import { useAuth } from "@/contexts/auth-context"

interface DashboardHeaderProps {
  userType: "admin" | "agent" | "assistant" | "client"
}

export function DashboardHeader({ userType }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  // Get the appropriate sidebar component based on user type
  const getSidebarComponent = () => {
    switch (userType) {
      case "admin":
        return <AdminSidebar />
      case "agent":
        return <AgentSidebar />
      case "assistant":
        return <AssistantSidebar />
      case "client":
        return <ClientSidebar />
      default:
        return null
    }
  }

  // Get the appropriate dashboard title based on user type and current path
  const getDashboardTitle = () => {
    // Extract the last part of the path
    const pathParts = pathname.split("/")
    const lastPart = pathParts[pathParts.length - 1]

    // If we're at the root of a dashboard, show the dashboard type
    if (pathname === `/dashboard/${userType}`) {
      switch (userType) {
        case "admin":
          return "Administration"
        case "agent":
          return "Espace Agent"
        case "assistant":
          return "Espace Assistant"
        case "client":
          return "Espace Client"
        default:
          return "Tableau de bord"
      }
    }

    // Otherwise, capitalize the last part of the path
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] pr-0">
              {getSidebarComponent()}
            </SheetContent>
          </Sheet>
          <Link href={`/dashboard/${userType}`} className="flex items-center gap-2">
            <span className="font-bold text-lg hidden md:inline-block">Cargo Express</span>
          </Link>
          <div className="hidden md:flex">
            <h1 className="text-xl font-semibold">{getDashboardTitle()}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                className="w-[200px] md:w-[300px]"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchOpen(false)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/${userType}/notifications`}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${userType}/profil`}>Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${userType}/parametres`}>Paramètres</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
