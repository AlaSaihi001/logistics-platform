import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return <div className={cn("flex-1 overflow-auto p-3 md:p-4 lg:p-6", className)}>{children}</div>
}

interface DashboardHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({ heading, description, children, className }: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6", className)}>
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl lg:text-3xl text-[#a22e2e]">{heading}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="mt-2 flex items-center gap-2 sm:mt-0">{children}</div>}
    </div>
  )
}

interface DashboardContentProps {
  children: React.ReactNode
  className?: string
}

export function DashboardContent({ children, className }: DashboardContentProps) {
  return <div className={cn("grid gap-4 md:gap-6", className)}>{children}</div>
}
