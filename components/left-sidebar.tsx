"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, CreditCard, MessageSquare, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

interface SidebarLink {
  icon: React.ReactNode
  label: string
  href: string
  roles: string[]
}

const sidebarLinks: SidebarLink[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Tableau de bord",
    href: "/dashboard/client",
    roles: ["client", "entreprise", "transporteur", "admin"],
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: "Commandes",
    href: "/dashboard/client/commandes",
    roles: ["client", "entreprise", "transporteur", "admin"],
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: "Factures",
    href: "/dashboard/client/factures",
    roles: ["client", "entreprise", "admin"],
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Support",
    href: "/dashboard/client/support",
    roles: ["client", "entreprise", "transporteur"],
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Paramètres",
    href: "/dashboard/client/settings",
    roles: ["client", "entreprise", "transporteur", "admin"],
  },
]

export function LeftSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-col border-r bg-muted/40">
      <nav className="grid gap-2 p-4">
        {sidebarLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              pathname === link.href
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
