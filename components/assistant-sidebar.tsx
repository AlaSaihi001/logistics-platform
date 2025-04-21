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
  Headphones,
  User,
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

interface AssistantSidebarProps {
  className?: string
}

export function AssistantSidebar({ className }: AssistantSidebarProps) {
  const pathname = usePathname()
  const { user, isLoading, requireAuth } = useAuthSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [assistantStats, setAssistantStats] = useState({
    pendingOrders: 0,
    pendingInvoices: 0,
    openTickets: 0,
    unreadNotifications: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authorized = await requireAuth(["ASSISTANT"])
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

  // Fetch assistant quick stats for sidebar
  useEffect(() => {
    const fetchAssistantStats = async () => {
      if (!isAuthorized) return

      try {
        setStatsLoading(true)
        setStatsError(null)

        const response = await fetch("/api/assistant/dashboard/quick-stats", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des statistiques")
        }

        const data = await response.json()
        setAssistantStats({
          pendingOrders: data.pendingOrders || 0,
          pendingInvoices: data.pendingInvoices || 0,
          openTickets: data.openTickets || 0,
          unreadNotifications: data.unreadNotifications || 0,
        })
      } catch (error) {
        console.error("Error fetching assistant stats:", error)
        setStatsError("Impossible de charger les statistiques")
      } finally {
        setStatsLoading(false)
      }
    }

    fetchAssistantStats()
  }, [isAuthorized])

  // Retry loading stats
  const retryLoadingStats = () => {
    setStatsLoading(true)
    setStatsError(null)

    fetch("/api/assistant/dashboard/quick-stats", {
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
        setAssistantStats({
          pendingOrders: data.pendingOrders || 0,
          pendingInvoices: data.pendingInvoices || 0,
          openTickets: data.openTickets || 0,
          unreadNotifications: data.unreadNotifications || 0,
        })
        toast({
          title: "Statistiques mises à jour",
          description: "Les statistiques ont été rechargées avec succès",
        })
      })
      .catch((error) => {
        console.error("Error retrying assistant stats:", error)
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
            <Link href="/auth/assistant/login">Se reconnecter</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12 w-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight text-purple-700">Assistant Client</h2>
          <p className="text-sm text-muted-foreground px-2 mb-6">Gestion des commandes et support client</p>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname === "/dashboard/assistant" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/assistant/commandes") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant/commandes">
                <Package className="mr-2 h-4 w-4" />
                Commandes
                {!statsLoading && assistantStats.pendingOrders > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                    {assistantStats.pendingOrders}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/assistant/factures") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant/factures">
                <FileText className="mr-2 h-4 w-4" />
                Factures
                {!statsLoading && assistantStats.pendingInvoices > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                    {assistantStats.pendingInvoices}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/assistant/support") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant/support">
                <Headphones className="mr-2 h-4 w-4" />
                Support
                {!statsLoading && assistantStats.openTickets > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                    {assistantStats.openTickets}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/assistant/notifications") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {!statsLoading && assistantStats.unreadNotifications > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                    {assistantStats.unreadNotifications}
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
              variant={pathname.includes("/dashboard/assistant/parametres") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant/parametres">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/assistant/profil") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/assistant/profil">
                <User className="mr-2 h-4 w-4" />
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
