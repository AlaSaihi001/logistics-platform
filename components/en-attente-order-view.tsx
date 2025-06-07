"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
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
  const handleChange = (key: string, value: any) => {
    console.log("OrderDetails handleChange:", key, value);
    const updated = { ...orderDetails, [key]: value };
    setOrderDetails(updated);
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Détails Commande</h2>

            <div className="space-y-2">
              <Label htmlFor="orderName">Nom commande</Label>
              <Input
                id="orderName"
                value={orderDetails.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={orderDetails.pays}
                onChange={(e) => handleChange("pays", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderAddress">Adresse de commande</Label>
              <Input
                id="orderAddress"
                value={orderDetails.adresse}
                onChange={(e) => handleChange("adresse", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date de pickup</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {orderDetails.dateDePickup.toLocaleDateString()}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={orderDetails.dateDePickup}
                    onSelect={(date) =>
                      handleChange("dateDePickup", date || new Date())
                    }
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchandiseValue">
                Valeur de marchandise (€)
              </Label>
              <Input
                id="merchandiseValue"
                type="number"
                value={orderDetails.valeurMarchandise}
                onChange={(e) =>
                  handleChange("valeurMarchandise", Number(e.target.value))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type de commande</Label>
              <RadioGroup
                value={orderDetails.typeCommande}
                onValueChange={(value) => handleChange("typeCommande", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="import" id="import" />
                  <Label htmlFor="import">Import</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="export" id="export" />
                  <Label htmlFor="export">Export</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Type de transport</Label>
              <RadioGroup
                value={orderDetails.typeTransport}
                onValueChange={(value) => handleChange("typeTransport", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maritime" id="maritime" />
                  <Label htmlFor="maritime">Maritime</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aerien" id="aerien" />
                  <Label htmlFor="aerien">Aérien</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="routier" id="routier" />
                  <Label htmlFor="routier">Routier</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ecoterms">Ecotermes</Label>
              <Select
                value={orderDetails.ecoterme}
                onValueChange={(value) => handleChange("ecoterme", value)}
              >
                <SelectTrigger id="ecoterms">
                  <SelectValue placeholder="Sélectionner un incoterm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CIF">CIF</SelectItem>
                  <SelectItem value="EXW">EXW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMode">Mode de paiement préféré</Label>
              <Select
                value={orderDetails.modePaiement}
                onValueChange={(value) => handleChange("modePaiement", value)}
              >
                <SelectTrigger id="paymentMode">
                  <SelectValue placeholder="Sélectionner un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                  <SelectItem value="Virement bancaire">
                    Virement bancaire
                  </SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
