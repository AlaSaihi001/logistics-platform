"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Filter,
  Briefcase,
  Truck,
  Headset,
  UserCog,
  Users,
} from "lucide-react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { DataTable } from "@/components/ui/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  indicatifPaysTelephone: string;
  telephone: number;
  motDePasse: string;
  image: string | null;
  role: "CLIENT";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface Facture {
  id: number;
  idCommande: number;
  idClient: number;
  idAgent: number;
  document: string;
  numeroFacture: number;
  montant: number;
  dateEmission: string; // ISO date string
  status: "Envoyée" | "Payée" | "Annulée"; // extend as needed
  assistantId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  client: Client;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { requireAuth } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState<Facture[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Facture[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [paymentStatusCount, setPaymentStatusCount] = useState<
    Record<string, number>
  >({});

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

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/admin/payments");

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des paiements");
        }

        const data = await response.json();
        setPayments(data);
        setFilteredPayments(data);
        const counts: Record<string, number> = {};
        data.forEach((payment: { status: string }) => {
          counts[payment.status] = (counts[payment.status] || 0) + 1;
        });
        setPaymentStatusCount(counts);
        console.log(counts);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Impossible de charger les paiements");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter payments based on search query and active tab
  useEffect(() => {
    if (!payments.length) return;

    let filtered = payments;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment: any) =>
          payment.id.toString().toLowerCase().includes(query) ||
          payment.client.nom.toLowerCase().includes(query) ||
          payment.client.prenom.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (payment: any) =>
          payment.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    setFilteredPayments(filtered);
  }, [searchQuery, activeTab, payments]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/payments");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des paiements");
      }

      const data = await response.json();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Error refreshing payments:", error);
      setError("Impossible de recharger les paiements");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/payments/export");

      if (!response.ok) {
        throw new Error("Erreur lors de l'exportation des paiements");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paiements.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error exporting payments:", error);
      setError("Impossible d'exporter les paiements");
    }
  };

  // Handle date range change
  const handleDateRangeChange = async (dateRange: { from: Date; to: Date }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/payments", {
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
        throw new Error("Erreur lors du chargement des paiements");
      }

      const data = await response.json();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Error fetching payments with date range:", error);
      setError("Impossible de charger les paiements");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des paiements
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <DateRangePicker onChange={handleDateRangeChange} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {Object.values(paymentStatusCount).reduce(
                  (sum, count) => sum + count,
                  0
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des Transactions enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transactions Payées
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {paymentStatusCount["Payée"] || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des Transactions Payées enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transactions En attente
            </CardTitle>
            <Headset className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {paymentStatusCount["En attente"] || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des Transactions En attente enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transactions En retard
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {paymentStatusCount["En retard"] || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des Transactions En retard enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transactions Annulés
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {paymentStatusCount["Annulé"] || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des Transactions Annulés enregistrés
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Gérez les Transactions de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un paiement..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="Payée">Payés</TabsTrigger>
                <TabsTrigger value="En attente">En attente</TabsTrigger>
                <TabsTrigger value="en retard">En retard</TabsTrigger>
                <TabsTrigger value="annulé">Annulés</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Numéro</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Expédition
                        </TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'émission
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'échéance
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            Aucune facture trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-medium">
                              {facture.id}
                            </TableCell>
                            <TableCell>{facture.client.nom}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {facture.dateEmission}
                            </TableCell>
                            <TableCell>{facture.montant}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.createdAt}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.updatedAt}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={facture.status as any} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {facture.document &&
                                  facture.document !== '""' && (
                                    <a
                                      href={facture.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          PDF
                                        </span>
                                      </Button>
                                    </a>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="Payée" className="mt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Numéro</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Expédition
                        </TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'émission
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'échéance
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            Aucune facture trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-medium">
                              {facture.id}
                            </TableCell>
                            <TableCell>{facture.client.nom}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {facture.dateEmission}
                            </TableCell>
                            <TableCell>{facture.montant}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.createdAt}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.updatedAt}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={facture.status as any} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {facture.document &&
                                  facture.document !== '""' && (
                                    <a
                                      href={facture.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          PDF
                                        </span>
                                      </Button>
                                    </a>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="En attente" className="mt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Numéro</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Expédition
                        </TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'émission
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'échéance
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            Aucune facture trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-medium">
                              {facture.id}
                            </TableCell>
                            <TableCell>{facture.client.nom}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {facture.dateEmission}
                            </TableCell>
                            <TableCell>{facture.montant}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.createdAt}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.updatedAt}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={facture.status as any} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {facture.document &&
                                  facture.document !== '""' && (
                                    <a
                                      href={facture.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          PDF
                                        </span>
                                      </Button>
                                    </a>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="en retard" className="mt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Numéro</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Expédition
                        </TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'émission
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'échéance
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            Aucune facture trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-medium">
                              {facture.id}
                            </TableCell>
                            <TableCell>{facture.client.nom}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {facture.dateEmission}
                            </TableCell>
                            <TableCell>{facture.montant}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.createdAt}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.updatedAt}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={facture.status as any} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {facture.document &&
                                  facture.document !== '""' && (
                                    <a
                                      href={facture.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          PDF
                                        </span>
                                      </Button>
                                    </a>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="annulé" className="mt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Numéro</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Expédition
                        </TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'émission
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Date d'échéance
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell>
                                <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            Aucune facture trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-medium">
                              {facture.id}
                            </TableCell>
                            <TableCell>{facture.client.nom}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {facture.dateEmission}
                            </TableCell>
                            <TableCell>{facture.montant}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.createdAt}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {facture.updatedAt}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={facture.status as any} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {facture.document &&
                                  facture.document !== '""' && (
                                    <a
                                      href={facture.document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          PDF
                                        </span>
                                      </Button>
                                    </a>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
