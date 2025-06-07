"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, FileText, Eye } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch commandes data
  useEffect(() => {
    const fetchCommandes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/agent/commandes");

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setCommandes(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          "Une erreur est survenue lors du chargement des commandes. Veuillez réessayer."
        );
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les commandes.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommandes();
  }, [toast]);

  // Fallback data for development/demo purposes
  const fallbackCommandes = [
    {
      id: "CMD-2023-089",
      client: "TechGlobal",
      nom: "Import matériel informatique",
      adresseDepart: "Shanghai, Chine",
      adresseDestination: "Paris, France",
      dateCommande: "15/03/2023",
      modeTransport: "maritime",
      status: "en-attente",
    },
    {
      id: "CMD-2023-088",
      client: "FashionRetail",
      nom: "Import textile",
      adresseDepart: "Mumbai, Inde",
      adresseDestination: "Marseille, France",
      dateCommande: "14/03/2023",
      modeTransport: "maritime",
      status: "acceptee",
    },
    {
      id: "CMD-2023-087",
      client: "AutoParts",
      nom: "Import pièces automobiles",
      adresseDepart: "Detroit, USA",
      adresseDestination: "Lyon, France",
      dateCommande: "12/03/2023",
      modeTransport: "aerien",
      status: "expediee",
    },
    {
      id: "CMD-2023-086",
      client: "HomeDecor",
      nom: "Import mobilier",
      adresseDepart: "Jakarta, Indonésie",
      adresseDestination: "Bordeaux, France",
      dateCommande: "10/03/2023",
      modeTransport: "maritime",
      status: "livree",
    },
    {
      id: "CMD-2023-085",
      client: "ElectroTech",
      nom: "Import électronique",
      adresseDepart: "Seoul, Corée du Sud",
      adresseDestination: "Lille, France",
      dateCommande: "08/03/2023",
      modeTransport: "aerien",
      status: "refusee",
    },
  ];

  // Use fallback data if loading or error
  const displayCommandes = isLoading || error ? fallbackCommandes : commandes;

  // Filtrer les commandes en fonction des critères
  const filteredCommandes = displayCommandes.filter((commande) => {
    const matchesSearch =
      commande.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.adresseDestinataire
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || commande.statut === statusFilter;
    const matchesTransport =
      transportFilter === "all" || commande.typeTransport === transportFilter;

    return matchesSearch && matchesStatus && matchesTransport;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            Gérez les commandes de transport et logistique
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
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
                  <SelectItem value="Validée">Acceptée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                  <SelectItem value="expediee">Expédiée</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={transportFilter}
                onValueChange={setTransportFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Mode de transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="maritime">Maritime</SelectItem>
                  <SelectItem value="aerien">Aérien</SelectItem>
                  <SelectItem value="routier">Routier</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrer</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Nom</TableHead>
                  <TableHead className="hidden lg:table-cell">Départ</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Destination
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
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
                          <div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
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
                ) : filteredCommandes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommandes.map((commande) => (
                    <TableRow key={commande.id}>
                      <TableCell className="font-medium">
                        {commande.id.toString()}
                      </TableCell>
                      <TableCell>{commande.client.nom}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {commande.nom}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {commande.adresse}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {commande.adresseDestinataire}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {commande.dateCommande}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            commande.statut === "Validée"
                              ? "Acceptée"
                              : commande.statut
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/dashboard/agent/commande/${commande.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Détails</span>
                            </Link>
                          </Button>
                          {(commande.statut === "Validée" ||
                            commande.statut === "expediee" ||
                            commande.statut === "livree") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                              asChild
                            >
                              <Link
                                href={`/dashboard/agent/factures?commande=${commande.id}`}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                  Facture
                                </span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
