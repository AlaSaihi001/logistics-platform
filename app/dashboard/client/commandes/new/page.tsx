"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderDetails } from "@/components/order-details";
import { SupplierRecipient } from "@/components/supplier-recipient";
import { ProductList } from "@/components/product-list";
import { AddNewProduct } from "@/components/add-new-product";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fr } from "date-fns/locale";

interface Product {
  id: string;
  image: string | File;
  name: string;
  category: string;
  unitPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  quantity: number;
  description: string;
  isFragile: boolean;
  packagingType: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState({});
  const [supplierRecipient, setSupplierRecipient] = useState({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [details, setDetails] = useState({
    nom: "",
    pays: "",
    adresse: "",
    nomDestinataire: "",
    paysDestinataire: "",
    adresseDestinataire: "",
    indicatifTelephoneDestinataire: "",
    telephoneDestinataire: "",
    emailDestinataire: "",
    valeurMarchandise: 0,
    typeCommande: "",
    typeTransport: "",
    ecoterme: "",
    modePaiement: "",
    dateDePickup: new Date(),
  });
  useEffect(() => {
    // Clean up object URLs when component unmounts
    return () => {
      products.forEach((product) => {
        if (
          typeof product.image === "string" &&
          product.image.startsWith("blob:")
        ) {
          URL.revokeObjectURL(product.image);
        }
      });
    };
  }, [products]);

  const handleAddOrEditProduct = (newOrUpdatedProduct: Product) => {
    if (newOrUpdatedProduct.id) {
      // Edit existing product
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === newOrUpdatedProduct.id
            ? {
                ...newOrUpdatedProduct,
                image:
                  newOrUpdatedProduct.image instanceof File
                    ? URL.createObjectURL(newOrUpdatedProduct.image)
                    : newOrUpdatedProduct.image,
              }
            : p
        )
      );
      toast({
        title: "Produit modifié",
        description: "Le produit a été mis à jour avec succès.",
      });
    } else {
      // Add new product
      const productWithId = {
        ...newOrUpdatedProduct,
        id: Date.now().toString(),
        image:
          newOrUpdatedProduct.image instanceof File
            ? URL.createObjectURL(newOrUpdatedProduct.image)
            : newOrUpdatedProduct.image,
      };
      setProducts((prevProducts) => [...prevProducts, productWithId]);
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à la commande avec succès.",
      });
    }
    setIsAddingProduct(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    if (products.length === 0) {
      toast({
        title: "Erreur",
        description: "Vous devez ajouter au moins un produit.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/commandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...details,
          ...supplierRecipient,
          produits: products,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data.validationErrors) {
          setErrors(data.validationErrors);
          toast({
            title: "Erreur de validation",
            description: "Veuillez corriger les erreurs dans le formulaire",
            variant: "destructive",
          });
          return;
        }

        // Handle other errors
        throw new Error(
          data.error || "Erreur lors de la création de la commande"
        );
      }

      // Success handling
      toast({
        title: "Commande créée avec succès !",
        description: "Vous pouvez suivre son état depuis la page Commandes.",
      });
      router.push("/dashboard/client/commandes");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de créer la commande",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleChange = (key: string, value: any) => {
    console.log("OrderDetails handleChange:", key, value);
    const updated = { ...details, [key]: value };
    setDetails(updated);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle Commande</h1>
        <p className="text-muted-foreground">
          Créez une nouvelle commande en remplissant le formulaire ci-dessous
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Détails Commande</h2>

                <div className="space-y-2">
                  <Label htmlFor="orderName">Nom commande</Label>
                  <Input
                    id="orderName"
                    value={details.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={details.pays}
                    onChange={(e) => handleChange("pays", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderAddress">Adresse de commande</Label>
                  <Input
                    id="orderAddress"
                    value={details.adresse}
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
                        <span>{details.dateDePickup.toLocaleDateString()}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={details.dateDePickup}
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
                    value={details.valeurMarchandise}
                    onChange={(e) =>
                      handleChange("valeurMarchandise", Number(e.target.value))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de commande</Label>
                  <RadioGroup
                    value={details.typeCommande}
                    onValueChange={(value) =>
                      handleChange("typeCommande", value)
                    }
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
                    value={details.typeTransport}
                    onValueChange={(value) =>
                      handleChange("typeTransport", value)
                    }
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
                    value={details.ecoterme}
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
                    value={details.modePaiement}
                    onValueChange={(value) =>
                      handleChange("modePaiement", value)
                    }
                  >
                    <SelectTrigger id="paymentMode">
                      <SelectValue placeholder="Sélectionner un mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carte bancaire">
                        Carte bancaire
                      </SelectItem>
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
          <Card>
            <CardContent className="pt-6">
              <SupplierRecipient onChange={setSupplierRecipient} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Liste des Produits</h2>
              <Button onClick={() => setIsAddingProduct(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter nouveau produit
              </Button>
            </div>

            {products.length > 0 ? (
              <ProductList products={products} setProducts={setProducts} />
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <PlusCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Aucun produit</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Commencez par ajouter un produit à votre commande.
                </p>
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  className="mt-4"
                >
                  Ajouter un produit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600"
            disabled={submitting}
          >
            {submitting ? "En cours..." : "Valider la commande"}
          </Button>
        </div>
      </form>

      <AddNewProduct
        open={isAddingProduct}
        onClose={() => setIsAddingProduct(false)}
        onAdd={handleAddOrEditProduct}
      />
    </div>
  );
}
