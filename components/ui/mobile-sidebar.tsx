"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
  children: React.ReactNode
  className?: string
}

export function MobileSidebar({ children, className }: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className={cn("p-0 w-64", className)}>
        {children}
      </SheetContent>
    </Sheet>
  )
}

interface MobileSidebarHeaderProps {
  title: string
  logo?: React.ReactNode
  onClose?: () => void
}

export function MobileSidebarHeader({ title, logo, onClose }: MobileSidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {logo}
        <span className="font-semibold">{title}</span>
      </div>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      )}
    </div>
  )
}
