"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  CreditCard,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { useParams } from "next/navigation";

interface Invoice {
  id: string;
  numeroFacture: number;
  dateEmission: string;
  montant: number;
  status: string;
  document: string;
  commande: {
    id: string;
    nom: string;
  };
  paiement: {
    id: string;
    statut: string;
  } | null;
}
interface FactureDetails {
  id: number;
  idCommande: number;
  idClient: number;
  numeroFacture: number;
  montant: number | null;
  dateEmission: string;
  status: string;
  commande: {
    nom: string;
    adresse: string;
  };
  client: {
    name: string;
    email: string;
  };
  paiement: {
    montant: number;
    datePaiement: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
export default function FacturesPage() {
  const [factureDetails, setFactureDetails] = useState<FactureDetails | null>(
    null
  );
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );
    const { id } = useParams();
  const factureId = id;

  useEffect(() => {
    // Utilisation correcte du factureId dans l'URL
    const fetchFactureDetails = async () => {
      try {
        console.log("FactureID:", factureId);
        const response = await fetch(`/api/factures/${factureId}`);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setFactureDetails(data);
        } else {
          toast({
            title: "Erreur",
            description: data.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Erreur serveur",
          description: "Impossible de charger la facture.",
          variant: "destructive",
        });
      }
    };

    // Vérifiez si factureId est défini avant de faire la requête
    if (factureId) {
      fetchFactureDetails();
    }
  }, [factureId]);
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/factures");
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Erreur lors du chargement des factures (${response.status})`
        );
      }

      const data = await response.json();
      console.log(data);
      // Format the data
      const formattedInvoices = data.map((invoice: any) => ({
        id: invoice.id.toString(),
        numeroFacture: invoice.numeroFacture,
        dateEmission: formatDate(invoice.dateEmission),
        montant: invoice.montant,
        status: invoice.status,
        document: invoice.document,
        commande: {
          id: invoice.commande.id.toString(),
          nom: invoice.commande.nom,
        },
        paiement: invoice.paiement
          ? {
              id: invoice.paiement.id.toString(),
              statut: invoice.paiement.statut,
            }
          : null,
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors du chargement des factures"
      );
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);
  const handlePayment = async () => {
    toast({
      title: "Payer maintenant",
      description: "Redirection vers la page de paiement...",
    });

    const res = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: factureDetails.montant,
        invoiceId: factureDetails.id,
      }),
    });

    const data = await res.json();

    if (data.sessionId) {
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      toast({
        title: "Erreur",
        description: "La session de paiement n'a pas pu être créée.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Filter invoices based on search term and status filter
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.numeroFacture.toString().includes(searchTerm) ||
      invoice.commande.nom.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const initiatePayment = async (invoiceId: string) => {
    setProcessingPayment(invoiceId);

    try {
      const response = await fetch("/api/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idFacture: invoiceId,
          modePaiement: "Carte bancaire",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Erreur lors de l'initiation du paiement (${response.status})`
        );
      }

      const data = await response.json();

      // Update the invoice locally
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === invoiceId
            ? {
                ...invoice,
                status: "En cours de paiement",
                paiement: {
                  id: data.id.toString(),
                  statut: data.statut,
                },
              }
            : invoice
        )
      );

      toast({
        title: "Paiement initié",
        description: "Votre paiement a été initié avec succès",
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'initier le paiement",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };
  console.log("Invoices:", invoices[0]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
        <p className="text-muted-foreground">
          Gérez vos factures et effectuez vos paiements
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchInvoices}>
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une facture..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Payée">Payée</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="En retard">En retard</SelectItem>
              <SelectItem value="En cours de paiement">
                En cours de paiement
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label="Réinitialiser les filtres"
            onClick={resetFilters}
            title="Réinitialiser les filtres"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Réinitialiser les filtres</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>
            Visualisez toutes vos factures et leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">
                    Numéro de Facture
                  </TableHead>
                  <TableHead className="font-medium">Date d'émission</TableHead>
                  <TableHead className="font-medium">Montant</TableHead>
                  <TableHead className="font-medium">Statut</TableHead>
                  <TableHead className="text-right font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        #{invoice.numeroFacture}
                      </TableCell>

                      <TableCell>{invoice.dateEmission}</TableCell>
                      <TableCell>
                        {invoice.montant.toLocaleString()} €
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/client/commandes/${invoice.commande.id}`}
                            className="hover:underline"
                          >
                            <Button variant="outline" size="sm">
                              Commande associée
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/client/factures/${invoice.id}`}
                          >
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </Link>
                          <a
                            href={invoice.document}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </a>
                          {(invoice.status === "En attente" ||
                            invoice.status === "En retard") &&
                            !invoice.paiement && (
                              <Button onClick={handlePayment} variant="default">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Payer maintenant
                                <CreditCard className="h-4 w-4 mr-2" />
                                {processingPayment === invoice.id
                                  ? "Traitement..."
                                  : "Payer"}
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {searchTerm || statusFilter !== "all" ? (
                        <div>
                          <p>
                            Aucune facture ne correspond à vos critères de
                            recherche
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={resetFilters}
                          >
                            Réinitialiser les filtres
                          </Button>
                        </div>
                      ) : (
                        <p>Vous n'avez pas encore de factures</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
