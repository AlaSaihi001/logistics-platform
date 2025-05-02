"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Printer,
  Share2,
  CreditCard,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Assurez-vous de récupérer factureId de manière dynamique
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

const FactureView = ({ factureId }: { factureId: number }) => {
  const [factureDetails, setFactureDetails] = useState<FactureDetails | null>(
    null
  );

  useEffect(() => {
    // Utilisation correcte du factureId dans l'URL
    const fetchFactureDetails = async () => {
      try {
        const response = await fetch(`/api/factures/${factureId}`);
        const data = await response.json();
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
  }, [factureId]); // Réexécution lorsque factureId change

  if (!factureDetails) {
    return <div>Loading...</div>;
  }

  const totalWithLateFees = factureDetails.montant || 0;

  const statusToVariantMap: { [key: string]: string } = {
    "En retard": "destructive",
    Payée: "default",
    "En attente": "secondary",
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">
          Facture {factureDetails.numeroFacture}
        </h1>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              toast({
                title: "Payer maintenant",
                description: "Redirection vers la page de paiement...",
              })
            }
            variant="default"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Payer maintenant
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Téléchargement démarré",
                description: `La facture ${factureDetails.numeroFacture} est en cours de téléchargement.`,
              })
            }
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Partage",
                description:
                  "Fonctionnalité de partage en cours de développement.",
              })
            }
            variant="outline"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>

      <Alert variant={statusToVariantMap[factureDetails.status] || "default"}>
        <AlertTitle>
          {factureDetails.status === "En retard"
            ? "Paiement en retard"
            : "Paiement en attente"}
        </AlertTitle>
        <AlertDescription>
          {factureDetails.status === "En retard" ? (
            <>
              Cette facture est en retard de paiement de{" "}
              {factureDetails.paiement?.datePaiement} jours. Des frais de retard
              de {factureDetails.paiement?.montant?.toFixed(2)} € ont été
              appliqués. Veuillez effectuer votre paiement dès que possible.
            </>
          ) : (
            <>Cette facture est en attente de paiement.</>
          )}
        </AlertDescription>
      </Alert>

      <div className="print:block print:my-8 hidden">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {factureDetails.commande.nom}
            </h1>
            <p className="text-muted-foreground">
              {factureDetails.commande.adresse}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">FACTURE</h2>
            <p className="text-muted-foreground">
              N° {factureDetails.numeroFacture}
            </p>
            <p className="text-muted-foreground">
              Date: {factureDetails.dateEmission}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="font-semibold">Facturé à:</h3>
          <p>{factureDetails.client.name}</p>
          <p>{factureDetails.client.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Informations de facturation</span>
            <Badge variant={statusToVariantMap[factureDetails.status]}>
              {factureDetails.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Numéro de facture:</span>
                <span>{factureDetails.numeroFacture}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date d'émission:</span>
                <span>{factureDetails.dateEmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Montant total:</span>
                <span className="font-semibold">
                  {totalWithLateFees.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="print:hidden" />
    </div>
  );
};

export default FactureView;
