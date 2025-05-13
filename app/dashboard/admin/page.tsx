"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  CreditCard,
  Package,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuthSession } from "@/hooks/use-auth-session";

// Active API integration for fetching dashboard data
export default function AdminDashboardPage() {
  const router = useRouter();
  const { requireAuth } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingPayments: 0,
    openTickets: 0,
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthorized = await requireAuth(["ADMIN"]);
      if (!isAuthorized) {
        router.push("/auth/login");
      }
    };
    checkAuth();
  }, [requireAuth, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/admin/dashboard/stats");

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Erreur de récupération des données:", error);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle date range change
  const handleDateRangeChange = async (dateRange: { from: Date; to: Date }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dashboard/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error(
        "Erreur de récupération des données avec la plage de dates:",
        error
      );
      setError("Impossible de charger les données du tableau de bord");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Tableau de bord administrateur
        </h1>
        <DateRangePicker
          value={["2023-01-01", "2023-12-31"]}
          onChange={handleDateRangeChange}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Utilisateurs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardData.totalUsers}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Total des utilisateurs enregistrés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardData.totalOrders}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">
                    {dashboardData.pendingOrders} en attente
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardData.totalRevenue.toFixed(2)} DT
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  <span className="text-amber-500">
                    {dashboardData.pendingPayments} paiements en attente
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Réclamations
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardData.openTickets}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Réclamations ouvertes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenus et Commandes récentes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Vue d'ensemble des revenus</CardTitle>
                <CardDescription>
                  Revenus mensuels pour l'année en cours
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Graphique des revenus
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
                <CardDescription>Les 5 dernières commandes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-center text-muted-foreground">
                      Liste des commandes récentes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques</CardTitle>
              <CardDescription>
                Statistiques détaillées de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Graphiques d'analytiques
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
              <CardDescription>
                Rapports générés pour la période sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Liste des rapports disponibles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Notifications système et alertes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Liste des notifications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
