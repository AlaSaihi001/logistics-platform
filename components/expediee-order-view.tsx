"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Clock, FileText, MapPin, Truck } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { ProductDetailsDialog } from "@/components/product-details-dialog";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  nom: string;
  categorie: string;
  tarifUnitaire: number;
  poids: number;
  largeur: number;
  longueur: number;
  hauteur: number;
  quantite: number;
  image?: string;
  description?: string;
  typeConditionnement: string;
  fragile: boolean;
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
  produits: Product[];
  factures: any[];
  createdAt: string;
  updatedAt: string;
  notes: [];
}

interface ExpedieeOrderViewProps {
  order: Order;
}

export function ExpedieeOrderView({ order }: ExpedieeOrderViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!order) {
    return <div>Données de commande non disponibles</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe] flex items-center gap-1 px-3 py-1"
            >
              <Truck className="h-4 w-4" />
              <span>Commande acceptée</span>
            </Badge>
          </div>
        </h1>

        <Button variant="outline">Imprimer commande</Button>
      </div>

      {/* Localisation & Suivi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Localisation & Suivi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="text-center mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-500">
                  {order.adresse || "N/A"}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {order.pays || "N/A"}
              </div>
              <div className="mt-2 text-sm text-gray-500">Date de départ</div>
              <div className="font-medium">
                <div className="font-medium">{order.dateDePickup || "N/A"}</div>
              </div>
            </div>

            <div className="flex-1 px-8 mt-4 hidden md:block">
              <Progress value={75} className="h-2" />
              <div className="mt-2 text-center text-sm text-blue-500">
                En transit
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-500">
                  {order.adresseDestinataire || "N/A"}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {order.paysDestinataire || "N/A"}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Date d'arrivée estimée
              </div>
              <div className="font-medium">
                <div className="font-medium">{order.dateArrivage || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              Position actuelle:{" "}
              <span className="font-medium">{order.adresseActuel}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                order.adresseActuel
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-blue-700">
                Voir sur la carte
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Produits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produits</CardTitle>
          <CardDescription>
            Liste des produits de votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Fragile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.produits && order.produits.length > 0 ? (
                order.produits.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.nom}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.nom}</TableCell>
                    <TableCell>{product.categorie || "-"}</TableCell>
                    <TableCell>{`${product.tarifUnitaire.toFixed(
                      2
                    )} €`}</TableCell>
                    <TableCell>{`${product.poids} Kg`}</TableCell>
                    <TableCell>{`${product.longueur}x${product.largeur}x${product.hauteur}`}</TableCell>
                    <TableCell>{product.quantite}</TableCell>
                    <TableCell>
                      {product.fragile ? (
                        <Badge variant="destructive">Oui</Badge>
                      ) : (
                        <Badge variant="secondary">Non</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Aucun produit
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* {order.notes?.map((note, index) => (
              <div key={index} className="flex items-start gap-2 text-blue-700">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{note}</span>
              </div>
            ))} */}
          </CardContent>
        </Card>

        {/* Facture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facture</CardTitle>
          </CardHeader>
          <CardContent>
            {order.factures && order.factures.length > 0 ? (
              <a
                href={order.factures[0].document}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Télécharger la facture
                </Button>
              </a>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                Aucune facture à afficher
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src="/placeholder.svg"
                alt="Support Agent"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <div className="font-medium">Sarah Dubois</div>
                <div className="text-sm text-gray-500">Agent de support</div>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div>Email: support@cargo.com</div>
              <div>Tél: +33 1 23 45 67 89</div>
            </div>
            <Button variant="outline" className="w-full">
              Contacter le support
            </Button>
          </CardContent>
        </Card>
      </div>
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
