"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDetailsDialog } from "@/components/product-details-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Define the ProductUI and Order interfaces

interface ProductUI {
  id?: number; // Local ID
  nom: string;
  categorie?: string;
  tarifUnitaire: number;
  poids: number;
  largeur: number;
  longueur: number;
  hauteur: number;
  quantite: number;
  typeConditionnement: string;
  fragile: boolean;
  description?: string;
  image?: string | File;
  document?: string;
}

interface Order {
  id: string;
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
  produits: ProductUI[];
  factures: any[];
  createdAt: string;
  updatedAt: string;
  notes: string[];
}

interface AnnuleeOrderViewProps {
  order: Order; // Use the Order type from page.tsx
}

export function AnnuleeOrderView({ order }: AnnuleeOrderViewProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ProductUI | null>(
    null
  );
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);

  if (!order) {
    return <div>Données de commande non disponibles</div>;
  }

  const handleRestartOrder = () => {
    setIsRestartDialogOpen(true);
  };

  const confirmRestartOrder = () => {
    // Récupérer les commandes existantes
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");

    // Trouver et mettre à jour la commande
    const updatedOrders = existingOrders.map((o: Order) => {
      if (o.id === order.id) {
        return {
          ...o,
          statut: "En attente",
        };
      }
      return o;
    });

    // Mettre à jour le localStorage
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Fermer la boîte de dialogue
    setIsRestartDialogOpen(false);

    // Afficher une notification
    toast({
      title: "Commande relancée",
      description: `La commande ${order.id} a été relancée avec succès.`,
    });

    // Rediriger vers la page de détails avec le nouveau statut
    router.push(`/dashboard/client/commandes/${order.id}?status=En attente`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Détails de la commande {order.id}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/client/commandes")}
        >
          Retour aux commandes
        </Button>
      </div>

      {/* General Information */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Informations Générales sur la Commande
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Numéro de Commande:</div>
              <div>{order.id || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Nom de Commande:</div>
              <div>{order.nom || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Statut:</div>
              <div className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                Annulée
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date de Commande:</div>
              <div>{order.dateDePickup || "N/A"}</div>
            </div>
            {order.nomDestinataire && (
              <div>
                <div className="text-sm text-gray-500">Fournisseur:</div>
                <div>{order.nomDestinataire}</div>
              </div>
            )}
            {order.typeTransport && (
              <div>
                <div className="text-sm text-gray-500">Mode de transport:</div>
                <div>{order.typeTransport}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Cette commande a été annulée suite à votre demande.</span>
            </div>
          </CardContent>
        </Card>

        {/* Invoice */}
        <Card>
          <CardHeader>
            <CardTitle>Facture</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Aucune facture n'a été générée pour cette commande annulée.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Facture non disponible
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support Client</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-4">
          <Image
            src="/placeholder.svg?height=64&width=64"
            alt="Support Agent"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <div className="font-medium">Samia Allagui</div>
            <div className="text-sm text-gray-500">
              <div>Numéro de Téléphone: +216 99 99 99 99</div>
              <div>Email: support@cargo.com</div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:ml-auto">
            <Button variant="outline">Contacter le support</Button>
          </div>
        </CardContent>
      </Card>

      {/* Restart Confirmation Dialog */}
      <Dialog open={isRestartDialogOpen} onOpenChange={setIsRestartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la relance</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir relancer cette commande ? Elle sera remise
            en statut "En attente" et devra être validée à nouveau.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestartDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={confirmRestartOrder}
            >
              Relancer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <ProductDetailsDialog
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
