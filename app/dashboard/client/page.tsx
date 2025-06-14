"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  AlertTriangle,
  Archive,
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
  const response = await fetch(`/api/client/commandes?clientId=${clientId}`);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des commandes.");
  }
  return response.json();
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
        const ordersData = await fetchClientOrders(clientId);
        setStats({
          delivered: ordersData.filter((o: any) => o.statut === "Livrée")
            .length,
          shipped: ordersData.filter((o: any) => o.statut === "Expédiée")
            .length,
          pending: ordersData.filter((o: any) => o.statut === "En attente")
            .length,
          cancelled: ordersData.filter((o: any) => o.statut === "Annulée")
            .length,
        });

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
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
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
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="mr-1 h-3 w-3" /> En attente
          </Badge>
        );
      case "Expédiée":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Truck className="mr-1 h-3 w-3" /> Expédiée
          </Badge>
        );
      case "Livrée":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Livrée
          </Badge>
        );
      case "Annulée":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Annulée
          </Badge>
        );
      case "Archivée":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <Archive className="mr-1 h-3 w-3" /> Archivée
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardShell className=" sm:px-6 lg:px-8 ">
      <DashboardHeader
        heading="Tableau de bord"
        description={`Bienvenue ${
          user?.name || ""
        } ! Voici un aperçu de votre activité.`}
      />
      <DashboardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button onClick={() => setError(null)} size="sm" className="ml-4">
              Réessayer
            </Button>
          </Alert>
        )}

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
              <StatCard
                title="Livrées"
                value={stats.delivered.toString()}
                icon={CheckCircle}
                colorScheme="green"
              />
              <StatCard
                title="Expédiées"
                value={stats.shipped.toString()}
                icon={Truck}
                colorScheme="blue"
              />
              <StatCard
                title="En attente"
                value={stats.pending.toString()}
                icon={Clock}
                colorScheme="amber"
              />
              <StatCard
                title="Annulées"
                value={stats.cancelled.toString()}
                icon={XCircle}
                colorScheme="red"
              />
            </>
          )}
        </div>

        {/* COMMANDES RÉCENTES */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Dernières commandes</CardTitle>
            <CardDescription>Vos 3 dernières commandes</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                {/* Version mobile : cartes verticales */}
                <div className="sm:hidden space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-base font-semibold">
                          {order.orderName}
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm">N°: {order.orderId}</p>
                      <p className="text-sm">
                        Transport: {order.transportType}
                      </p>
                      <p className="text-sm">Date: {order.orderDate}</p>
                      <p className="text-sm">
                        Destinataire: {order.recipientName}
                      </p>
                      <Link
                        href={`/dashboard/client/commandes/${order.orderId}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full whitespace-nowrap"
                        >
                          Détails
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Version desktop : tableau */}
                <div className="hidden sm:block overflow-x-auto">
                  <div className="min-w-[700px] text-sm">
                    <DataTable
                      data={recentOrders}
                      columns={[
                        {
                          header: "N°",
                          accessorKey: "orderId",
                          className: "font-medium",
                        },
                        { header: "Commande", accessorKey: "orderName" },
                        { header: "Transport", accessorKey: "transportType" },
                        { header: "Date", accessorKey: "orderDate" },
                        {
                          header: "Destinataire",
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="whitespace-nowrap"
                              >
                                Détails
                              </Button>
                            </Link>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
