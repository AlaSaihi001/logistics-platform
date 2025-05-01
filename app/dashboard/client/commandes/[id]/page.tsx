"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { ProductList } from "@/components/product-list";

import { LivreeOrderView } from "@/components/livree-order-view";
import { ExpedieeOrderView } from "@/components/expediee-order-view";
import { EnAttenteOrderView } from "@/components/en-attente-order-view";
import { AnnuleeOrderView } from "@/components/annulee-order-view";
import { ArchiveeOrderView } from "@/components/archivee-order-view";
import { AddNewProduct } from "@/components/add-new-product";
import { AccepteeOrderView } from "@/components/acceptee-order-view";

interface ProductUI {
  id?: number; // Local ID (موش قاعدة البيانات)
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductUI | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/commandes/${orderId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      const data = await response.json();

      const formattedOrder = {
        ...data,
        dateDePickup: new Date(data.dateDePickup).toLocaleDateString("fr-FR"),
        createdAt: new Date(data.createdAt).toLocaleDateString("fr-FR"),
        updatedAt: new Date(data.updatedAt).toLocaleDateString("fr-FR"),
        factures: data.factures.map((facture: any) => ({
          ...facture,
          dateEmission: new Date(facture.dateEmission).toLocaleDateString(
            "fr-FR"
          ),
        })),
      };

      setOrder(formattedOrder);
      setProducts(data.produits || []);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
      toast({
        title: "Erreur",
        description: "Impossible de charger la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancellingOrder(true);
    try {
      const response = await fetch(`/api/commandes/${orderId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation");
      }
      setOrder({ ...order, statut: "Annulée" });
      toast({
        title: "Commande annulée",
        description: "La commande a été annulée avec succès",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande",
        variant: "destructive",
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-10 space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Commande #{order.id} - {order.nom}
        </h1>
        <p className="text-muted-foreground">
          Créée le {order.createdAt} • Mise à jour le {order.updatedAt}
        </p>
      </div>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        {/* --- Détails commande --- */}
        <TabsContent value="details">
          {order.statut === "Livrée" && <LivreeOrderView order={order} />}
          {order.statut === "Expédiée" && <ExpedieeOrderView order={order} />}
          {order.statut === "En attente" && (
            <EnAttenteOrderView
              order={order}
              onCancel={handleCancelOrder}
              isCancelling={cancellingOrder}
            />
          )}
          {order.statut === "Acceptée" && <AccepteeOrderView order={order} />}
          {order.statut === "Annulée" && <AnnuleeOrderView order={order} />}
          {order.statut === "Archivée" && <ArchiveeOrderView order={order} />}
        </TabsContent>

        {/* --- Produits --- */}

        {/* --- Tracking --- */}
        <TabsContent value="tracking">
          <div className="p-8 border rounded text-center">
            Suivi en cours de développement...
          </div>
        </TabsContent>

        {/* --- Factures --- */}
        {order.factures.length > 0 && (
          <TabsContent value="factures">
            <div className="space-y-4">
              {order.factures.map((facture) => (
                <div key={facture.id} className="border p-4 rounded">
                  <p className="font-bold">Facture #{facture.numeroFacture}</p>
                  <p className="text-muted-foreground">{facture.status}</p>
                  <Link href={`/dashboard/client/factures/${facture.id}`}>
                    <Button variant="link">Voir détails</Button>
                  </Link>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* --- Modal Add/Edit Produit --- */}
      {isModalOpen && (
        <AddNewProduct
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onAdd={(product) => {
            if (editingProduct) {
              setProducts((prev) =>
                prev.map((p) =>
                  p === editingProduct
                    ? { ...product, id: editingProduct.id }
                    : p
                )
              );
            } else {
              setProducts((prev) => [...prev, { ...product, id: Date.now() }]);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct}
        />
      )}
    </div>
  );
}
