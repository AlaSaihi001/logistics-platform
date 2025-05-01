"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import {
  DashboardContent,
  DashboardHeader,
  DashboardShell,
} from "@/components/ui/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OrderData {
  orderId: string;
  orderName: string;
  transportType: string;
  pickupDate: string;
  recipientName: string;
  status: string;
  merchandiseValue: number;
  orderDate: string;
}

interface ClientDashboardProps {
  clientId: number;
}

const fetchClientOrders = async (clientId: number) => {
  try {
    const ordersResponse = await fetch(
      `/api/client/commandes?clientId=${clientId}`
    );
    if (!ordersResponse.ok) {
      throw new Error(
        `Erreur lors du chargement des commandes: ${ordersResponse.status}`
      );
    }
    return ordersResponse.json();
  } catch (error) {
    throw error;
  }
};

export default function ClientDashboard({ clientId }: ClientDashboardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    delivered: 0,
    shipped: 0,
    pending: 0,
    cancelled: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer les commandes du client avec son ID
        const ordersData = await fetchClientOrders(clientId);

        // Calculer les statistiques
        const stats = {
          delivered: ordersData.filter(
            (order: any) => order.statut === "Livrée"
          ).length,
          shipped: ordersData.filter(
            (order: any) => order.statut === "Expédiée"
          ).length,
          pending: ordersData.filter(
            (order: any) => order.statut === "En attente"
          ).length,
          cancelled: ordersData.filter(
            (order: any) => order.statut === "Annulée"
          ).length,
        };
        setStats(stats);

        // Récupérer les 3 dernières commandes
        const recent = ordersData
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3)
          .map((order: any) => ({
            orderId: order.id.toString(),
            orderName: order.nom,
            transportType: order.typeTransport,
            pickupDate: new Date(order.dateDePickup).toLocaleDateString(
              "fr-FR"
            ),
            recipientName: order.nomDestinataire,
            status: order.statut,
            merchandiseValue: order.valeurMarchandise,
            orderDate: new Date(order.createdAt).toLocaleDateString("fr-FR"),
          }));
        setRecentOrders(recent);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite lors du chargement des données"
        );
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En attente":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-200"
          >
            <Clock className="mr-1 h-3 w-3" /> En attente
          </Badge>
        );
      case "Expédiée":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            <Truck className="mr-1 h-3 w-3" /> Expédié
          </Badge>
        );
      case "Livrée":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" /> Livré
          </Badge>
        );
      case "Annulée":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <XCircle className="mr-1 h-3 w-3" /> Annulé
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tableau de bord"
        description={`Bienvenue ${
          user?.name || ""
        }! Voici un aperçu de votre activité sur la plateforme`}
      />

      <DashboardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setError(null)}
            >
              Réessayer
            </Button>
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatCard
                title="Commandes livrées"
                value={stats.delivered.toString()}
                icon={CheckCircle}
                colorScheme="green"
              />
              <StatCard
                title="Commandes expédiées"
                value={stats.shipped.toString()}
                icon={Truck}
                colorScheme="blue"
              />
              <StatCard
                title="Commandes en attente"
                value={stats.pending.toString()}
                icon={Clock}
                colorScheme="amber"
              />
              <StatCard
                title="Commandes annulées"
                value={stats.cancelled.toString()}
                icon={XCircle}
                colorScheme="red"
              />
            </>
          )}
        </div>

        {/* Dernières commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Dernières commandes passées</CardTitle>
            <CardDescription>Vos 3 dernières commandes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <DataTable
                data={recentOrders}
                columns={[
                  {
                    header: "Numéro de commande",
                    accessorKey: "orderId",
                    className: "font-medium",
                  },
                  { header: "Nom de la commande", accessorKey: "orderName" },
                  { header: "Mode de transport", accessorKey: "transportType" },
                  { header: "Date de commande", accessorKey: "orderDate" },
                  {
                    header: "Fournisseur/Destinataire",
                    accessorKey: "recipientName",
                  },
                  {
                    header: "Statut",
                    accessorKey: "status",
                    cell: (item) => getStatusBadge(item.status),
                  },
                  {
                    header: "Actions",
                    accessorKey: "orderId",
                    className: "text-right",
                    cell: (item) => (
                      <Link
                        href={`/dashboard/client/commandes/${item.orderId}`}
                      >
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </Link>
                    ),
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
