"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  AlertTriangle,
  Truck,
  MessageSquare,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Bell,
  HelpCircle,
  PieChart,
  PackageCheck,
  LineChart,
  User,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuthSession } from "@/hooks/use-auth-session"

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, isLoading, requireAuth } = useAuthSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [adminStats, setAdminStats] = useState({
    pendingOrders: 0,
    pendingPayments: 0,
    openTickets: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authorized = await requireAuth(["ADMIN"])
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

  // Fetch admin quick stats for sidebar
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!isAuthorized) return

      try {
        setStatsLoading(true)
        setStatsError(null)

        const response = await fetch("/api/admin/dashboard/quick-stats", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des statistiques")
        }

        const data = await response.json()
        setAdminStats({
          pendingOrders: data.pendingOrders || 0,
          pendingPayments: data.pendingPayments || 0,
          openTickets: data.openTickets || 0,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        setStatsError("Impossible de charger les statistiques")
      } finally {
        setStatsLoading(false)
      }
    }

    fetchAdminStats()
  }, [isAuthorized])

  // Retry loading stats
  const retryLoadingStats = () => {
    setStatsLoading(true)
    setStatsError(null)

    fetch("/api/admin/dashboard/quick-stats", {
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
        setAdminStats({
          pendingOrders: data.pendingOrders || 0,
          pendingPayments: data.pendingPayments || 0,
          openTickets: data.openTickets || 0,
        })
        toast({
          title: "Statistiques mises à jour",
          description: "Les statistiques ont été rechargées avec succès",
        })
      })
      .catch((error) => {
        console.error("Error retrying admin stats:", error)
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
            <Link href="/auth/admin/login">Se reconnecter</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12 w-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight text-[#a22e2e]">Administration</h2>
          <p className="text-sm text-muted-foreground px-2 mb-6">Gestion de la plateforme logistique</p>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname === "/dashboard/admin" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/utilisateurs") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/utilisateurs">
                <Users className="mr-2 h-4 w-4" />
                Utilisateurs
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/commandes") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/commandes">
                <Truck className="mr-2 h-4 w-4" />
                Commandes
                {!statsLoading && adminStats.pendingOrders > 0 && (
                  <span className="ml-auto bg-[#a22e2e] text-white text-xs rounded-full px-2 py-0.5">
                    {adminStats.pendingOrders}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/paiements") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/paiements">
                <CreditCard className="mr-2 h-4 w-4" />
                Paiements
                {!statsLoading && adminStats.pendingPayments > 0 && (
                  <span className="ml-auto bg-[#a22e2e] text-white text-xs rounded-full px-2 py-0.5">
                    {adminStats.pendingPayments}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/reclamations") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/reclamations">
                <MessageSquare className="mr-2 h-4 w-4" />
                Réclamations
                {!statsLoading && adminStats.openTickets > 0 && (
                  <span className="ml-auto bg-[#a22e2e] text-white text-xs rounded-full px-2 py-0.5">
                    {adminStats.openTickets}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/methodes-paiement") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/methodes-paiement">
                <Wallet className="mr-2 h-4 w-4" />
                Méthodes de paiement
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/notifications") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Rapports</h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/rapports/financiers") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/rapports/financiers">
                <PieChart className="mr-2 h-4 w-4" />
                Rapports financiers
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/rapports/logistique") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/rapports/logistique">
                <PackageCheck className="mr-2 h-4 w-4" />
                Rapports logistiques
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/rapports/performance") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/rapports/performance">
                <LineChart className="mr-2 h-4 w-4" />
                Rapports de performance
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/rapports/utilisateurs") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/rapports/utilisateurs">
                <BarChart3 className="mr-2 h-4 w-4" />
                Rapports utilisateurs
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
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Système</h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/securite") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/securite">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Sécurité
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/logs") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/logs">
                <FileText className="mr-2 h-4 w-4" />
                Logs système
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/support") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/support">
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/parametres") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/parametres">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname.includes("/dashboard/admin/profil") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/admin/profil">
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
