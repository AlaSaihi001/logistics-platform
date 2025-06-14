"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Receipt,
  HeadphonesIcon,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AssistantStatsCard } from "@/components/assistant-stats-card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface Order {
  id: number;
  nom: string;
  client: {
    nom: string;
    prenom: string;
  };
  status: string;
  dateCommande: string;
}

interface Ticket {
  id: number;
  sujet: string;
  client: {
    nom: string;
    prenom: string;
  };
  status: string;
  date: string;
}

export default function AssistantDashboardPage() {
  const { user, isLoading, requireAuth } = useAuthSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("apercu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    validatedOrders: 0,
    pendingInvoices: 0,
    supportTickets: 0,
  });
  const [urgentOrders, setUrgentOrders] = useState<Order[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);

  // Check authentication and role
  const checkAuthorization = useCallback(async () => {
    try {
      setIsAuthorized(await requireAuth(["ASSISTANT"]));
    } catch (error) {
      setError("Erreur d'authentification. Veuillez vous reconnecter.");
      console.error("Authentication error:", error);
    }
  }, [requireAuth]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  useEffect(() => {
    if (isAuthorized) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch data in parallel
          const [ordersResponse, invoicesResponse, ticketsResponse] =
            await Promise.all([
              fetch("/api/assistant/commandes", {
                headers: {
                  "Cache-Control": "no-cache",
                },
              }),
              fetch("/api/assistant/factures", {
                headers: {
                  "Cache-Control": "no-cache",
                },
              }),
              fetch("/api/assistant/reclamations", {
                headers: {
                  "Cache-Control": "no-cache",
                },
              }),
            ]);

          // Check for response errors
          if (!ordersResponse.ok) {
            const errorData = await ordersResponse.json().catch(() => ({}));
            throw new Error(
              errorData.error || "Erreur lors du chargement des commandes"
            );
          }
          if (!invoicesResponse.ok) {
            const errorData = await invoicesResponse.json().catch(() => ({}));
            throw new Error(
              errorData.error || "Erreur lors du chargement des factures"
            );
          }
          if (!ticketsResponse.ok) {
            const errorData = await ticketsResponse.json().catch(() => ({}));
            throw new Error(
              errorData.error || "Erreur lors du chargement des tickets"
            );
          }

          const ordersData = await ordersResponse.json();
          console.log("ordersData", ordersData);
          const invoicesData = await invoicesResponse.json();
          console.log("invoicesData", invoicesData);
          const ticketsData = await ticketsResponse.json();
          console.log("ticketsData", ticketsData);

          // Calculate stats
          const pendingOrders = ordersData.filter(
            (order: any) => order.statut === "En attente"
          ).length;
          console.log(pendingOrders);
          const validatedOrders = ordersData.filter((order: any) =>
            ["Validée", "Expédiée", "Livrée"].includes(order.statut)
          ).length;
          console.log(validatedOrders);
          // Get urgent orders (pending orders)
          const urgent = ordersData
            .filter((order: any) => order.statut === "En attente")
            .slice(0, 3)
            .map((order: any) => ({
              id: order.id,
              nom: order.nom,
              client: order.client,
              status: order.statut,
              dateCommande: order.dateCommande,
            }));

          // Count pending invoices
          const pendingInvoices = invoicesData.filter(
            (invoice: any) =>
              invoice.status === "En attente" ||
              invoice.status === "Non Envoyée"
          ).length;

          // Count support tickets and get recent ones
          const supportTickets = ticketsData.filter(
            (ticket: any) =>
              ticket.status === "En attente" || ticket.status === "En cours"
          ).length;

          const recent = ticketsData
            .filter((ticket: any) => ticket.status === "En attente")
            .slice(0, 3)
            .map((ticket: any) => ({
              id: ticket.id,
              sujet: ticket.sujet,
              client: ticket.client,
              status: ticket.status,
              date: ticket.date,
            }));

          // Update state
          setStats({
            pendingOrders,
            validatedOrders,
            pendingInvoices,
            supportTickets,
          });
          setUrgentOrders(urgent);
          setRecentTickets(recent);
          setDashboardDataLoaded(true);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Erreur lors du chargement des données"
          );
          toast({
            title: "Erreur",
            description:
              error instanceof Error
                ? error.message
                : "Impossible de charger les données du tableau de bord",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [toast, isAuthorized]);

  // If still loading or not authorized, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // If there's an authentication error
  if (error && !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur d'authentification</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href="/auth/assistant/login">Se reconnecter</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      case "Validée":
        return "bg-green-100 text-green-800";
      case "Ouverte":
        return "bg-blue-100 text-blue-800";
      case "En cours":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to retry loading data
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // This will trigger the useEffect again
    checkAuthorization();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue, {user?.name}. Voici un aperçu de votre activité.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AssistantStatsCard
          title="Commandes à valider"
          value={stats.pendingOrders.toString()}
          icon={Package}
          trend={{ value: 3, isPositive: false }}
          loading={loading}
        />
        <AssistantStatsCard
          title="Commandes validées"
          value={stats.validatedOrders.toString()}
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
          loading={loading}
        />
        <AssistantStatsCard
          title="Factures à envoyer"
          value={stats.pendingInvoices.toString()}
          icon={Receipt}
          trend={{ value: 4, isPositive: false }}
          loading={loading}
        />
        <AssistantStatsCard
          title="Tickets support"
          value={stats.supportTickets.toString()}
          icon={HeadphonesIcon}
          trend={{ value: 2, isPositive: false }}
          loading={loading}
        />
      </div>

      <Tabs defaultValue="commandes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commandes">Commandes urgentes</TabsTrigger>
          <TabsTrigger value="reclamations">Réclamations récentes</TabsTrigger>
        </TabsList>
        <TabsContent value="commandes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes en attente de validation</CardTitle>
              <CardDescription>
                Ces commandes nécessitent votre attention immédiate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : urgentOrders.length > 0 ? (
                <div className="space-y-4">
                  {urgentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.nom}</span>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(order.status)}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Client: {order.client.prenom} {order.client.nom}
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link
                          href={`/dashboard/assistant/commande/${order.id}`}
                        >
                          Voir détails
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/assistant/commandes">
                        Voir toutes les commandes
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune commande en attente de validation
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reclamations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Réclamations récentes</CardTitle>
              <CardDescription>
                Les réclamations clients nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : recentTickets.length > 0 ? (
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.sujet}</span>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(ticket.status)}
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Client: {ticket.client.prenom} {ticket.client.nom}
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link
                          href={`/dashboard/assistant/support/${ticket.id}`}
                        >
                          Voir détails
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/assistant/support">
                        Voir toutes les réclamations
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune réclamation récente
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
