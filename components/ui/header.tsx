"use client"

import type * as React from "react"
import Link from "next/link"
import { Bell, LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:px-6", className)}>
      {children}
    </header>
  )
}

interface HeaderContentProps {
  className?: string
  children: React.ReactNode
}

export function HeaderContent({ className, children }: HeaderContentProps) {
  return <div className={cn("flex flex-1 items-center justify-between", className)}>{children}</div>
}

interface HeaderActionsProps {
  className?: string
  children: React.ReactNode
}

export function HeaderActions({ className, children }: HeaderActionsProps) {
  return <div className={cn("flex items-center gap-2", className)}>{children}</div>
}

interface UserMenuProps {
  name: string
  email: string
  imageUrl?: string
  role?: string
  onLogout?: () => void
}

export function UserMenu({ name, email, imageUrl, role, onLogout }: UserMenuProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 flex items-center gap-2 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{name}</p>
            {role && <p className="text-xs text-muted-foreground">{role}</p>}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface NotificationsProps {
  count?: number
  onClick?: () => void
}

export function Notifications({ count, onClick }: NotificationsProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <span className="sr-only">Notifications</span>
      <div className="relative">
        <Bell className="h-5 w-5" />
        {count && count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </div>
    </Button>
  )
}
