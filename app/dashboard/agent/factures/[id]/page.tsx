"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Receipt,
  Download,
  Send,
  Bell,
  Check,
  Building,
  CreditCard,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
// Types for our data
export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  indicatifPaysTelephone: string;
  telephone: number;
  motDePasse: string;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commande {
  id: number;
  clientId: number;
  assistantId: number;
  agentId: number;
  nom: string;
  pays: string;
  adresse: string;
  dateDePickup: string;
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
  dateCommande: string;
  createdAt: string;
  updatedAt: string;
  notes: any[];
  produits: any[]; // You can replace `any` with a more specific type if needed
}

export interface Facture {
  id: number;
  idCommande: number;
  idClient: number;
  idAgent: number;
  document: string;
  numeroFacture: number;
  montant: number;
  dateEmission: string;
  status: string;
  assistantId: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  commande: Commande;
}
// Données fictives pour une facture
const getFactureDetails = (id: string) => {
  return {
    modePaiement: "Virement bancaire",
    coordonneesBancaires: {
      iban: "FR76 1234 5678 9012 3456 7890 123",
      bic: "ABCDEFGHIJK",
      banque: "Banque Internationale",
    },
  };
};

export default function FactureDetailsPage() {
  console.log("FactureDetailsPage rendered");

  const params = useParams();
  console.log("params:", params);

  const factureId = params.id as string;
  console.log("factureId:", factureId);
  const [facture, setFacture] = useState<Facture | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    const fetchFactures = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/agent/factures/${factureId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch invoice");
        }

        const data = await response.json();
        setFacture(data);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError(
          "Une erreur est survenue lors du chargement de la facture. Veuillez réessayer."
        );
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger la facture.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFactures();
  }, [factureId]);

  const handleSendInvoice = async (factureId: string) => {
    try {
      const response = await fetch(`/api/agent/factures/${factureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "envoyer" }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invoice");
      }

      toast({
        title: "Facture envoyée",
        description: "La facture a été envoyée au client avec succès.",
      });

      // Update the local state to reflect the change
      // ✅ Since facture is a single object, update it directly
      setFacture((prevFacture) =>
        prevFacture && prevFacture.id.toString() === factureId
          ? { ...prevFacture, status: "Envoyée" }
          : prevFacture
      );
    } catch (err) {
      console.error("Error sending invoice:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer la facture. Veuillez réessayer.",
      });
    }
  };

  const handleMarkAsPaid = async (factureId: string) => {
    try {
      const response = await fetch(`/api/agent/factures/${factureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "payer" }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invoice");
      }

      toast({
        title: "Facture Payée",
        description: "La facture a été envoyée au client avec succès.",
      });

      // Update the local state to reflect the change
      // ✅ Since facture is a single object, update it directly
      setFacture((prevFacture) =>
        prevFacture && prevFacture.id.toString() === factureId
          ? { ...prevFacture, status: "Payée" }
          : prevFacture
      );
    } catch (err) {
      console.error("Error sending invoice:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer la facture. Veuillez réessayer.",
      });
    }
  };

  const handleRemindClient = () => {
    // Ici, vous implémenteriez la logique pour relancer le client
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/agent/factures">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {factureId}
            </h1>
            <StatusBadge status={facture?.status as any} className="ml-2" />
          </div>
          <p className="text-muted-foreground mt-1">
            Expédition {facture?.dateEmission}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={facture?.document} download>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Télécharger PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium text-lg">{facture?.client?.nom}</p>
              <p className="whitespace-pre-line text-muted-foreground">
                {facture?.client?.adresse}
              </p>
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="break-all">{facture?.client?.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {facture?.client?.telephone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-primary" />
              Détails de la facture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Numéro de facture
                </p>
                <p className="font-medium">{factureId}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Expédition</p>
                <p className="font-medium">{facture?.commande?.dateDePickup}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Date d'émission</p>
                <p className="font-medium">{facture?.dateEmission}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Date d'échéance</p>
                <p className="font-medium">{facture?.dateEmission}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Statut</p>
                <StatusBadge status={facture?.status as any} />
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Mode de paiement
                </p>
                <p className="font-medium">{facture?.commande?.modePaiement}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Détails des prestations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facture?.commande?.produits.map((ligne, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {ligne.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {ligne.quantite}
                    </TableCell>
                    <TableCell className="text-right">
                      {ligne.tarifUnitaire.toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      {ligne.tarifUnitaire.toFixed(2) * ligne.quantite} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{facture?.montant?.toFixed(2) * 0.8} €</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (20%)</span>
              <span>{(facture?.montant?.toFixed(2) * 0.2).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
              <span>Total</span>
              <span>{facture?.montant?.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Coordonnées bancaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">IBAN</p>
            <p className="font-mono font-medium break-all">
              {facture?.coordonneesBancaires?.iban}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">BIC</p>
            <p className="font-mono font-medium">
              {facture?.coordonneesBancaires?.bic}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Banque</p>
            <p className="font-medium">
              {facture?.coordonneesBancaires?.banque}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
          {facture?.status === "En attente" && (
            <Button
              className="gap-2 bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
              onClick={() => handleSendInvoice(factureId)}
            >
              <Send className="h-4 w-4" />
              Envoyer au client
            </Button>
          )}
          {status === "en-retard" && (
            <Button
              className="gap-2 bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
              onClick={handleRemindClient}
            >
              <Bell className="h-4 w-4" />
              Relancer le client
            </Button>
          )}
          {(facture?.status === "En attente" ||
            facture?.status === "Envoyée") && (
            <Button
              className="gap-2 bg-green-500 hover:bg-green-600 w-full sm:w-auto"
              onClick={() => handleMarkAsPaid(factureId)}
            >
              <Check className="h-4 w-4" />
              Marquer comme payée
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
