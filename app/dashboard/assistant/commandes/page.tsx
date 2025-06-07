"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
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

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Commande {
  id: number;
  clientId: number;
  assistantId: number;
  agentId: number;
  nom: string;
  pays: string;
  adresse: string;
  dateDePickup: string | Date;
  dateArrivage: string;
  valeurMarchandise: number;
  typeCommande: string;
  typeTransport: string;
  ecoterme: string;
  modePaiement: string;
  nomDestinataire: string;
  paysDestinataire: string;
  adresseDestinataire: string;
  indicatifTelephoneDestinataire: string;
  telephoneDestinataire: number;
  emailDestinataire: string;
  statut: string;
  adresseActuel: string;
  dateCommande: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  notes: Record<string, string>; // or `{ [key: string]: string }`
  client: Client;
  produits: any[]; // Define a proper Product interface if needed
}

export default function CommandesPage() {
  const { isLoading: authLoading, requireAuth } = useAuthSession();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [commandesList, setCommandesList] = useState<Commande[]>([]);
  const [originalCommandes, setOriginalCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Fetch commandes data
  useEffect(() => {
    const fetchCommandes = async () => {
      if (!isAuthorized) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/assistant/commandes", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Erreur lors du chargement des commandes"
          );
        }

        const data = await response.json();
        setOriginalCommandes(data);
        setCommandesList(data);

        // Extract unique clients for filter
        const uniqueClientsMap = new Map<number, Client>();
        (data as Commande[]).forEach((commande: Commande) => {
          if (!uniqueClientsMap.has(commande.client.id)) {
            uniqueClientsMap.set(commande.client.id, commande.client);
          }
        });
        const uniqueClients: Client[] = Array.from(uniqueClientsMap.values());
        setClients(uniqueClients);

        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching commandes:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des commandes"
        );
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de charger les commandes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [isAuthorized, toast, itemsPerPage]);

  // Apply filters
  useEffect(() => {
    if (originalCommandes.length === 0) return;

    const filtered = originalCommandes.filter((commande) => {
      const matchesSearch =
        commande.id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        commande.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commande.adresseDestinataire
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        commande.statut.toLowerCase() === statusFilter.toLowerCase();
      const matchesClient =
        clientFilter === "all" ||
        commande.client.nom.toLowerCase() === clientFilter.toLowerCase();

      const matchesDate =
        !dateFilter ||
        commande.dateCommande === format(dateFilter, "dd/MM/yyyy");

      return matchesSearch && matchesStatus && matchesClient && matchesDate;
    });

    setCommandesList(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1); // Reset to first page when filters change
  }, [
    searchTerm,
    statusFilter,
    clientFilter,
    dateFilter,
    originalCommandes,
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

      const response = await fetch("/api/assistant/commandes", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors du chargement des commandes"
        );
      }

      const data = await response.json();
      setOriginalCommandes(data);

      // Apply current filters to new data
      const filtered = (data as Commande[]).filter((commande: Commande) => {
        const matchesSearch =
          commande.id
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          commande.client.nom
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          commande.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          commande.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
          commande.adresseDestinataire
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          commande.statut.toLowerCase() === statusFilter.toLowerCase();
        const matchesClient =
          clientFilter === "all" || commande.client.nom === clientFilter;

        const matchesDate =
          !dateFilter ||
          commande.dateCommande === format(dateFilter, "dd/MM/yyyy");

        return matchesSearch && matchesStatus && matchesClient && matchesDate;
      });

      setCommandesList(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));

      // Extract unique clients for filter
      const uniqueClients = Array.from(
        new Set(data.map((commande: Commande) => commande.client))
      );
      setClients(uniqueClients);

      toast({
        title: "Données actualisées",
        description: "La liste des commandes a été mise à jour.",
      });
    } catch (error) {
      console.error("Error refreshing commandes:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'actualisation des commandes"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'actualiser les commandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const paginatedCommandes = commandesList.slice(
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
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            Gérez les commandes des clients
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
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            Consultez et gérez toutes les commandes
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
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="acceptee">Acceptée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                  <SelectItem value="Expédiée">Expédiée</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
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
                  <TableHead className="w-[120px]">ID Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Nom commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Adresse départ
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Adresse destinataire
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCommandes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCommandes.map((commande) => (
                    <TableRow key={commande.id}>
                      <TableCell className="font-medium">
                        {commande.id}
                      </TableCell>
                      <TableCell>{commande.client.nom}</TableCell>
                      <TableCell>{commande.nom}</TableCell>
                      <TableCell>{commande.dateCommande.toString()}</TableCell>
                      <TableCell
                        className="hidden xl:table-cell max-w-[200px] truncate"
                        title={commande.adresse}
                      >
                        {commande.adresse}
                      </TableCell>
                      <TableCell
                        className="hidden xl:table-cell max-w-[200px] truncate"
                        title={commande.adresseDestinataire}
                      >
                        {commande.adresseDestinataire}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={commande.statut as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/assistant/commande/${commande.id}`}
                          >
                            Détails
                          </Link>
                        </Button>
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
