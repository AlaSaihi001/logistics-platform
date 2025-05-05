"use client";

import { Alert } from "@/components/ui/alert";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  AlertTriangle,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ShieldAlert,
  Headphones,
  FileText,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DateRangePicker } from "@/components/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/hooks/use-auth-session";

// Données pour les tableaux
const recentOrders = [
  {
    id: "ORD-2023-1234",
    client: "TechGlobal",
    date: "15/03/2023",
    montant: "1,250.00 €",
    statut: "en-attente",
  },
  {
    id: "ORD-2023-1233",
    client: "MediPharma",
    date: "14/03/2023",
    montant: "2,780.00 €",
    statut: "en-cours",
  },
  {
    id: "ORD-2023-1232",
    client: "FashionRetail",
    date: "13/03/2023",
    montant: "3,450.00 €",
    statut: "livree",
  },
  {
    id: "ORD-2023-1231",
    client: "AutoParts",
    date: "12/03/2023",
    montant: "2,150.00 €",
    statut: "annulee",
  },
  {
    id: "ORD-2023-1230",
    client: "HomeDecor",
    date: "11/03/2023",
    montant: "1,890.00 €",
    statut: "livree",
  },
];

const recentTransactions = [
  {
    id: "TRX-2023-001",
    client: "TechGlobal",
    facture: "FAC-2023-056",
    montant: "1,250.00 €",
    date: "15/03/2023",
    modePaiement: "Carte bancaire",
    statut: "complete",
  },
  {
    id: "TRX-2023-002",
    client: "MediPharma",
    facture: "FAC-2023-057",
    montant: "2,780.00 €",
    date: "16/03/2023",
    modePaiement: "Virement bancaire",
    statut: "pending",
  },
  {
    id: "TRX-2023-003",
    client: "FashionRetail",
    facture: "FAC-2023-055",
    montant: "3,450.00 €",
    date: "14/03/2023",
    modePaiement: "PayPal",
    statut: "complete",
  },
  {
    id: "TRX-2023-004",
    client: "AutoParts",
    facture: "FAC-2023-054",
    montant: "2,150.00 €",
    date: "12/03/2023",
    modePaiement: "Carte bancaire",
    statut: "failed",
  },
  {
    id: "TRX-2023-005",
    client: "HomeDecor",
    facture: "FAC-2023-053",
    montant: "1,890.00 €",
    date: "10/03/2023",
    modePaiement: "Virement bancaire",
    statut: "complete",
  },
];

const recentUsers = [
  {
    id: "USR-2023-456",
    nom: "Karim Benzidi",
    email: "karim.b@example.com",
    telephone: "+212 612 345 678",
    date: "15/03/2023",
    type: "client",
    statut: "actif",
  },
  {
    id: "USR-2023-455",
    nom: "Leila Hadid",
    email: "leila.h@example.com",
    telephone: "+212 623 456 789",
    date: "14/03/2023",
    type: "agent",
    statut: "actif",
  },
  {
    id: "USR-2023-454",
    nom: "Mehdi Alaoui",
    email: "mehdi.a@example.com",
    telephone: "+212 634 567 890",
    date: "13/03/2023",
    type: "client",
    statut: "actif",
  },
  {
    id: "USR-2023-453",
    nom: "Samira Tazi",
    email: "samira.t@example.com",
    telephone: "+212 645 678 901",
    date: "12/03/2023",
    type: "client",
    statut: "inactif",
  },
  {
    id: "USR-2023-452",
    nom: "Youssef Berrada",
    email: "youssef.b@example.com",
    telephone: "+212 656 789 012",
    date: "11/03/2023",
    type: "agent",
    statut: "actif",
  },
];

const paymentMethods = [
  {
    id: "PM-001",
    nom: "Carte bancaire",
    description: "Paiement par carte Visa, Mastercard, etc.",
    frais: "2.5%",
    statut: "actif",
  },
  {
    id: "PM-002",
    nom: "Virement bancaire",
    description: "Paiement par virement SEPA ou international",
    frais: "0.5%",
    statut: "actif",
  },
  {
    id: "PM-003",
    nom: "PayPal",
    description: "Paiement via compte PayPal",
    frais: "3.5%",
    statut: "actif",
  },
  {
    id: "PM-004",
    nom: "Espèces",
    description: "Paiement en espèces à la livraison",
    frais: "0%",
    statut: "inactif",
  },
  {
    id: "PM-005",
    nom: "Chèque",
    description: "Paiement par chèque bancaire",
    frais: "0%",
    statut: "inactif",
  },
];

// Fonction pour obtenir le badge de statut
const getStatusBadge = (status: string) => {
  switch (status) {
    case "en-attente":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
        >
          <Clock className="mr-1 h-3 w-3" /> En attente
        </Badge>
      );
    case "en-cours":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
        >
          <Truck className="mr-1 h-3 w-3" /> En cours
        </Badge>
      );
    case "livree":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Livrée
        </Badge>
      );
    case "annulee":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
        >
          <XCircle className="mr-1 h-3 w-3" /> Annulée
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Fonction pour obtenir le badge de statut de transaction
const getTransactionStatusBadge = (status: string) => {
  switch (status) {
    case "complete":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Complétée
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
        >
          <Clock className="mr-1 h-3 w-3" /> En attente
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
        >
          <XCircle className="mr-1 h-3 w-3" /> Échouée
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Fonction pour obtenir le badge de type d'utilisateur
const getUserTypeBadge = (type: string) => {
  switch (type) {
    case "client":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
        >
          <Users className="mr-1 h-3 w-3" /> Client
        </Badge>
      );
    case "agent":
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100"
        >
          <Truck className="mr-1 h-3 w-3" /> Agent
        </Badge>
      );
    case "assistant":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
        >
          <Headphones className="mr-1 h-3 w-3" /> Assistant
        </Badge>
      );
    case "admin":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
        >
          <ShieldAlert className="mr-1 h-3 w-3" /> Admin
        </Badge>
      );
    default:
      return <Badge>{type}</Badge>;
  }
};

// Fonction pour obtenir le badge de statut d'utilisateur
const getUserStatusBadge = (status: string) => {
  switch (status) {
    case "actif":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Actif
        </Badge>
      );
    case "inactif":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
        >
          <XCircle className="mr-1 h-3 w-3" /> Inactif
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Fonction pour obtenir le badge de statut de méthode de paiement
const getPaymentMethodStatusBadge = (status: string) => {
  switch (status) {
    case "actif":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Actif
        </Badge>
      );
    case "inactif":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
        >
          <XCircle className="mr-1 h-3 w-3" /> Inactif
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

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
          throw new Error(
            "Erreur lors du chargement des données du tableau de bord"
          );
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        throw new Error(
          "Erreur lors du chargement des données du tableau de bord"
        );
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data with date range:", error);
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
          value={"yourDateRange"}
          onChange={handleDateRangeChange}
        />{" "}
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
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
