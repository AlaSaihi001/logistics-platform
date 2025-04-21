"use client"

import { Bell, Settings, LogOut, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Menu } from "lucide-react"

interface AgentHeaderProps {
  toggleSidebar: () => void
}

export function AgentHeader({ toggleSidebar }: AgentHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center">
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/dashboard/agent" className="flex items-center gap-2 font-bold">
            <div className="bg-primary text-primary-foreground p-1 rounded">📌</div>
            LogiTech
          </Link>
        </div>
        <div className="hidden md:flex md:items-center md:gap-2">
          <Link href="/dashboard/agent" className="flex items-center gap-2 font-bold">
            <div className="bg-primary text-primary-foreground p-1 rounded">📌</div>
            LogiTech
          </Link>
        </div>

        {/* Search Bar */}
        <div className="ml-auto flex-1 md:ml-4 md:max-w-sm lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-full bg-background pl-8 rounded-full h-9 border-muted"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ml-4 flex items-center gap-4">
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-2">
                <div className="flex w-full justify-between">
                  <span className="font-medium">Nouvelle expédition</span>
                  <span className="text-xs text-muted-foreground">Il y a 5 min</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Une nouvelle expédition a été créée (EXP-2023-096)
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-2">
                <div className="flex w-full justify-between">
                  <span className="font-medium">Document en attente</span>
                  <span className="text-xs text-muted-foreground">Il y a 1 heure</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Un document requiert votre validation (DOC-2023-048)
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg" alt="Marie Dupont" />
                  <AvatarFallback className="bg-primary/10 text-primary">MD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Marie Dupont" />
                  <AvatarFallback className="bg-primary/10 text-primary">MD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">Marie Dupont</p>
                  <p className="text-xs text-muted-foreground">Agent Logistique</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/agent/profil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth/login" className="cursor-pointer text-red-600 hover:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex md:items-center md:gap-2">
            <span className="text-sm font-medium">Bonjour, Marie 👋</span>
            <span className="text-xs text-muted-foreground">Agent Logistique</span>
          </div>
        </div>
      </div>
    </header>
  )
}
