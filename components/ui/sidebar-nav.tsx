"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  className?: string
  children: React.ReactNode
}

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <div className={cn("hidden border-r bg-card md:block md:w-64 md:flex-col", className)}>
      <ScrollArea className="h-full">{children}</ScrollArea>
    </div>
  )
}

interface SidebarHeaderProps {
  className?: string
  children: React.ReactNode
}

export function SidebarHeader({ className, children }: SidebarHeaderProps) {
  return <div className={cn("flex h-16 items-center border-b px-4", className)}>{children}</div>
}

interface SidebarNavProps {
  className?: string
  children: React.ReactNode
}

export function SidebarNav({ className, children }: SidebarNavProps) {
  return <nav className={cn("grid gap-1 p-2", className)}>{children}</nav>
}

interface SidebarNavItemProps {
  href: string
  icon: LucideIcon
  label: string
  badge?: React.ReactNode
  isActive?: boolean
}

export function SidebarNavItem({ href, icon: Icon, label, badge, isActive }: SidebarNavItemProps) {
  const pathname = usePathname()
  const active = isActive !== undefined ? isActive : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
      asChild
    >
      <Link href={href}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        {badge && <span className="ml-auto">{badge}</span>}
      </Link>
    </Button>
  )
}

interface SidebarSectionProps {
  title?: string
  className?: string
  children: React.ReactNode
}

export function SidebarSection({ title, className, children }: SidebarSectionProps) {
  return (
    <div className={cn("py-2", className)}>
      {title && <h3 className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase">{title}</h3>}
      <div className="grid gap-1">{children}</div>
    </div>
  )
}

interface SidebarFooterProps {
  className?: string
  children: React.ReactNode
}

export function SidebarFooter({ className, children }: SidebarFooterProps) {
  return <div className={cn("border-t p-4", className)}>{children}</div>
}
