"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Send,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Facture {
  id: number;
  idCommande: number;
  idClient: number;
  idAgent: number;
  assistantId: number;
  numeroFacture: number;
  montant: number;
  document: string;
  dateEmission: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    nom: string;
    prenom: string;
  };
  commande: {
    id: number;
    nom: string;
  };
}

export default function FacturesPage() {
  const { isLoading: authLoading, requireAuth } = useAuthSession();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [facturesList, setFacturesList] = useState<Facture[]>([]);
  const [originalFactures, setOriginalFactures] = useState<Facture[]>([]);
  interface Client {
    id: number;
    nom: string;
    prenom: string;
  }
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch factures data
  useEffect(() => {
    const fetchFactures = async () => {
      if (!isAuthorized) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/assistant/factures", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Erreur lors du chargement des factures"
          );
        }

        const data = await response.json();
        setOriginalFactures(data);
        setFacturesList(data);

        // Extract unique clients for filter
        const uniqueClientsMap = new Map<number, Client>();
        data.forEach((facture: Facture) => {
          if (!uniqueClientsMap.has(facture.client.id)) {
            uniqueClientsMap.set(facture.client.id, facture.client);
          }
        });
        const uniqueClients = Array.from(uniqueClientsMap.values());
        setClients(uniqueClients);

        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching factures:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des factures"
        );
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de charger les factures",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFactures();
  }, [isAuthorized, toast, itemsPerPage]);

  // Apply filters
  useEffect(() => {
    if (originalFactures.length === 0) return;

    const filtered = originalFactures.filter((facture) => {
      const matchesSearch =
        facture.id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        facture.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.commande.nom.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || facture.status === statusFilter;
      const matchesClient =
        clientFilter === "all" || facture.client.nom === clientFilter;

      const matchesDate =
        !dateFilter ||
        facture.dateEmission === format(dateFilter, "dd/MM/yyyy");

      return matchesSearch && matchesStatus && matchesClient && matchesDate;
    });

    setFacturesList(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1); // Reset to first page when filters change
  }, [
    searchTerm,
    statusFilter,
    clientFilter,
    dateFilter,
    originalFactures,
    itemsPerPage,
  ]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClientFilter("all");
    setDateFilter(undefined);
  };

  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/assistant/factures", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors du chargement des factures"
        );
      }

      const data = await response.json();
      setOriginalFactures(data);

      // Apply current filters to new data
      const filtered = data.filter((facture: Facture) => {
        const matchesSearch =
          facture.id
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          facture.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facture.commande.nom.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || facture.status === statusFilter;
        const matchesClient =
          clientFilter === "all" || facture.client.nom === clientFilter;

        const matchesDate =
          !dateFilter ||
          facture.dateEmission === format(dateFilter, "dd/MM/yyyy");

        return matchesSearch && matchesStatus && matchesClient && matchesDate;
      });

      setFacturesList(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));

      // Extract unique clients for filter
      const uniqueClientsMap = new Map<number, Client>();
      data.forEach((facture: Facture) => {
        if (!uniqueClientsMap.has(facture.client.id)) {
          uniqueClientsMap.set(facture.client.id, facture.client);
        }
      });
      const uniqueClients = Array.from(uniqueClientsMap.values());
      setClients(uniqueClients);

      toast({
        title: "Données actualisées",
        description: "La liste des factures a été mise à jour.",
      });
    } catch (error) {
      console.error("Error refreshing factures:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'actualisation des factures"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'actualiser les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sending invoice
  const handleSendInvoice = async (id: string) => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/assistant/factures/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "envoyer",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors de l'envoi de la facture"
        );
      }

      // Update local state
      setFacturesList(
        facturesList.map((facture) =>
          facture.id.toString() === id
            ? { ...facture, status: "Envoyée" }
            : facture
        )
      );

      toast({
        title: "Facture envoyée",
        description: `La facture ${id} a été envoyée au client avec succès.`,
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer la facture",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination
  const paginatedFactures = facturesList.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthorized && error) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            Gérez les factures des commandes
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>
            Consultez et gérez toutes les factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Non Envoyée">Non Envoyée</SelectItem>
                  <SelectItem value="Envoyée">Envoyée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.nom}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter
                      ? format(dateFilter, "dd/MM/yyyy")
                      : "Filtrer par date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={resetFilters}
                title="Réinitialiser les filtres"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Réinitialiser les filtres</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Date d'émission
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedFactures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFactures.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="font-medium">
                        {facture.id}
                      </TableCell>
                      <TableCell>{facture.client.nom}</TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/assistant/commande/${facture.commande.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {facture.commande.nom}
                        </Link>
                      </TableCell>
                      <TableCell>{facture.montant}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {facture.dateEmission}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={facture.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/dashboard/assistant/factures/${facture.id}`}
                            >
                              Voir
                            </Link>
                          </Button>
                          <a
                            href={facture.document}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">PDF</span>
                            </Button>
                          </a>
                          {facture.status === "En attente" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                                  disabled={submitting}
                                >
                                  {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                  <span className="hidden sm:inline">
                                    Envoyer
                                  </span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Envoyer la facture
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir envoyer la facture{" "}
                                    {facture.id} au client {facture.client.nom}{" "}
                                    ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={submitting}>
                                    Annuler
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleSendInvoice(facture.id.toString())
                                    }
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={submitting}
                                  >
                                    {submitting ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Envoi en cours...
                                      </>
                                    ) : (
                                      "Envoyer"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Précédent
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages || loading}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
