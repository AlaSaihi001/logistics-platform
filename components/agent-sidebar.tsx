"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  AlertTriangle,
  Bell,
  Truck,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuthSession } from "@/hooks/use-auth-session"

interface AgentSidebarProps {
  className?: string
}

export function AgentSidebar({ className }: AgentSidebarProps) {
  const pathname = usePathname()
  const { user, isLoading, requireAuth } = useAuthSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [agentStats, setAgentStats] = useState({
    pendingOrders: 0,
    pendingDocuments: 0,
    pendingInvoices: 0,
    unreadNotifications: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authorized = await requireAuth(["AGENT"])
        setIsAuthorized(authorized)
        setAuthError(null)
      } catch (error) {
        console.error("Authentication error:", error)
        setAuthError("Erreur d'authentification. Veuillez vous reconnecter.")
        setIsAuthorized(false)
      }
    }

    checkAuth()
  }, [requireAuth])

  // Fetch agent quick stats for sidebar
  useEffect(() => {
    const fetchAgentStats = async () => {
      if (!isAuthorized) return

      try {
        setStatsLoading(true)
        setStatsError(null)

        const response = await fetch("/api/agent/dashboard/quick-stats", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des statistiques")
        }

        const data = await response.json()
        setAgentStats({
          pendingOrders: data.pendingOrders || 0,
          pendingDocuments: data.pendingDocuments || 0,
          pendingInvoices: data.pendingInvoices || 0,
          unreadNotifications: data.unreadNotifications || 0,
        })
      } catch (error) {
        console.error("Error fetching agent stats:", error)
        setStatsError("Impossible de charger les statistiques")
      } finally {
        setStatsLoading(false)
      }
    }

    fetchAgentStats()
  }, [isAuthorized])

  // Retry loading stats
  const retryLoadingStats = () => {
    setStatsLoading(true)
    setStatsError(null)

    fetch("/api/agent/dashboard/quick-stats", {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des statistiques")
        }
        return response.json()
      })
      .then((data) => {
        setAgentStats({
          pendingOrders: data.pendingOrders || 0,
          pendingDocuments: data.pendingDocuments || 0,
          pendingInvoices: data.pendingInvoices || 0,
          unreadNotifications: data.unreadNotifications || 0,
        })
        toast({
          title: "Statistiques mises à jour",
          description: "Les statistiques ont été rechargées avec succès",
        })
      })
      .catch((error) => {
        console.error("Error retrying agent stats:", error)
        setStatsError("Impossible de charger les statistiques")
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de recharger les statistiques",
        })
      })
      .finally(() => {
        setStatsLoading(false)
      })
  }

  if (isLoading) {
    return (
      <div className={cn("pb-12 w-full", className)}>
        <div className="space-y-4 py-4">
          <div className="px-4 py-2">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-4 w-[200px] mt-2" />
          </div>
          <div className="px-4">
            <Skeleton className="h-8 w-full" />
          </div>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="px-4 py-1">
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className={cn("pb-12 w-full", className)}>
        <div className="space-y-4 py-4 px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/auth/agent/login">Se reconnecter</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12 w-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight text-[#074e6e]">Agent Logistique</h2>
          <p className="text-sm text-muted-foreground px-2 mb-6">Gestion des expéditions et documents</p>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname === "/dashboard/agent" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/agent/commandes") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent/commandes">
                <Package className="mr-2 h-4 w-4" />
                Commandes
                {!statsLoading && agentStats.pendingOrders > 0 && (
                  <span className="ml-auto bg-[#074e6e] text-white text-xs rounded-full px-2 py-0.5">
                    {agentStats.pendingOrders}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/agent/documents") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent/documents">
                <FileText className="mr-2 h-4 w-4" />
                Documents
                {!statsLoading && agentStats.pendingDocuments > 0 && (
                  <span className="ml-auto bg-[#074e6e] text-white text-xs rounded-full px-2 py-0.5">
                    {agentStats.pendingDocuments}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/agent/factures") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent/factures">
                <CreditCard className="mr-2 h-4 w-4" />
                Factures
                {!statsLoading && agentStats.pendingInvoices > 0 && (
                  <span className="ml-auto bg-[#074e6e] text-white text-xs rounded-full px-2 py-0.5">
                    {agentStats.pendingInvoices}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/agent/notifications") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {!statsLoading && agentStats.unreadNotifications > 0 && (
                  <span className="ml-auto bg-[#074e6e] text-white text-xs rounded-full px-2 py-0.5">
                    {agentStats.unreadNotifications}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {statsLoading && (
          <div className="px-6 py-2">
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs text-muted-foreground">Chargement des statistiques...</span>
            </div>
          </div>
        )}

        {statsError && (
          <div className="px-6 py-2">
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs flex items-center justify-between">
                <span>{statsError}</span>
                <Button variant="ghost" size="sm" onClick={retryLoadingStats} className="h-6 px-2">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Separator className="my-4" />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Paramètres</h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname.includes("/dashboard/agent/parametres") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent/parametres">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/agent/profil") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/agent/profil">
                <Truck className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
            >
              <Link href="/auth/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
