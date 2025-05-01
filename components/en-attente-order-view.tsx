"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { OrderDetails } from "@/components/order-details";
import { SupplierRecipient } from "@/components/supplier-recipient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddNewProduct } from "@/components/add-new-product";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

import { Product } from "@/types/product";

interface EnAttenteOrderViewProps {
  order: any;
  onCancel: () => Promise<void>;
  isCancelling?: boolean;
}

export function EnAttenteOrderView({
  order,
  onCancel,
  isCancelling = false,
}: EnAttenteOrderViewProps) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(order.produits || []);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [orderDetails, setOrderDetails] = useState<any>({
    nom: order.nom,
    pays: order.pays,
    adresse: order.adresse,
    dateDePickup: new Date(order.dateDePickup),
    valeurMarchandise: order.valeurMarchandise,
    typeCommande: order.typeCommande,
    typeTransport: order.typeTransport,
    ecoterme: order.ecoterme,
    modePaiement: order.modePaiement,
  });

  const [recipientDetails, setRecipientDetails] = useState<any>({
    nomDestinataire: order.nomDestinataire,
    paysDestinataire: order.paysDestinataire,
    adresseDestinataire: order.adresseDestinataire,
    indicatifTelephoneDestinataire: order.indicatifTelephoneDestinataire,
    telephoneDestinataire: order.telephoneDestinataire,
    emailDestinataire: order.emailDestinataire,
  });

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
  };

  const validateFields = () => {
    const mandatoryFields = [
      orderDetails.nom,
      orderDetails.pays,
      orderDetails.adresse,
      orderDetails.dateDePickup,
      orderDetails.valeurMarchandise,
      orderDetails.typeCommande,
      orderDetails.typeTransport,
      orderDetails.ecoterme,
      orderDetails.modePaiement,
      recipientDetails.nomDestinataire,
      recipientDetails.paysDestinataire,
      recipientDetails.adresseDestinataire,
      recipientDetails.indicatifTelephoneDestinataire,
      recipientDetails.telephoneDestinataire,
      recipientDetails.emailDestinataire,
    ];

    return mandatoryFields.every(
      (field) => field !== undefined && field !== "" && field !== null
    );
  };

  const saveModifications = async () => {
    if (!validateFields()) {
      toast({
        title: "Champs manquants",
        description:
          "Veuillez remplir tous les champs obligatoires avant d'enregistrer.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/commandes/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderDetails,
          ...recipientDetails,
          produits: products,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement");
      }

      toast({
        title: "Succès",
        description: "Modifications enregistrées avec succès",
      });

      setTimeout(() => {
        router.push("/dashboard/client/commandes");
      }, 1000); // petite pause avant le redirect pour laisser voir le toast
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 🛡 Statut */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1 px-3 py-1"
        >
          <Clock className="h-4 w-4" />
          <span>En attente de traitement</span>
        </Badge>
        <Button
          variant="destructive"
          onClick={onCancel}
          disabled={isCancelling}
        >
          {isCancelling ? "Annulation en cours..." : "Annuler la commande"}
        </Button>
      </div>

      {/* 🛡 Détails commande */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la commande</CardTitle>
          <CardDescription>
            Informations générales sur votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderDetails
            order={orderDetails}
            onChange={(updated) =>
              setOrderDetails((prev: any) => ({ ...prev, ...updated }))
            }
          />
        </CardContent>
      </Card>

      {/* 🛡 Fournisseur et Destinataire */}
      <Card>
        <CardHeader>
          <CardTitle>Fournisseur et Destinataire</CardTitle>
          <CardDescription>
            Informations sur l'expéditeur et le destinataire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierRecipient
            supplier={{
              nom: orderDetails.nom,
              pays: orderDetails.pays,
              adresse: orderDetails.adresse,
            }}
            recipient={recipientDetails}
            onChange={(updated) =>
              setRecipientDetails((prev: any) => ({ ...prev, ...updated }))
            }
          />
        </CardContent>
      </Card>

      {/* 🛡 Produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
          <CardDescription>
            Liste des produits de votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setEditingProduct({} as Product)}>
              Ajouter un produit
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Fragile</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.nom}</TableCell>
                  <TableCell>{product.categorie || "-"}</TableCell>
                  <TableCell>{product.tarifUnitaire.toFixed(2)} €</TableCell>
                  <TableCell>{product.poids} Kg</TableCell>
                  <TableCell>{`${product.longueur}x${product.largeur}x${product.hauteur}`}</TableCell>
                  <TableCell>{product.quantite}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.fragile ? "destructive" : "secondary"}
                    >
                      {product.fragile ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 🛡 Informations importantes */}
      <Card>
        <CardHeader className="bg-orange-50 border-b">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <CardTitle>Informations importantes</CardTitle>
              <CardDescription>
                À propos de votre commande en attente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p>
              Votre commande est en attente de traitement. Vous serez notifié
              dès qu'elle sera prise en charge.
            </p>
            <Separator />
            <ol className="list-decimal pl-5 space-y-1">
              <li>Validation</li>
              <li>Préparation</li>
              <li>Expédition</li>
              <li>Suivi</li>
            </ol>
            <Separator />
            <p>
              Besoin d'aide ? Contactez-nous au +216 99 99 99 99 ou
              support@cargo.com
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 BOUTON SAUVEGARDE */}
      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={saveModifications}>
          Enregistrer toutes les modifications
        </Button>
      </div>

      {/* 🔥 Modal Ajouter/Modifier produit */}
      {editingProduct && (
        <AddNewProduct
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onAdd={(newProduct) => {
            if (editingProduct && editingProduct.id) {
              setProducts((prev) =>
                prev.map((p) => (p.id === editingProduct.id ? newProduct : p))
              );
            } else {
              setProducts((prev) => [
                ...prev,
                { ...newProduct, id: Date.now() },
              ]);
            }
            setEditingProduct(null);
          }}
          initialData={
            Object.keys(editingProduct).length ? editingProduct : undefined
          }
        />
      )}
    </div>
  );
}
