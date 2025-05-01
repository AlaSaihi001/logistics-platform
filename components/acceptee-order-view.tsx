"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface AccepteeOrderViewProps {
  order: any;
}

export function AccepteeOrderView({ order }: AccepteeOrderViewProps) {
  return (
    <div className="space-y-6">
      {/* Statut */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 px-3 py-1"
        >
          <Clock className="h-4 w-4" />
          <span>Commande acceptée</span>
        </Badge>
      </div>

      {/* Détails commande */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la commande</CardTitle>
          <CardDescription>Informations confirmées</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Nom de la commande :</strong> {order.nom}
          </p>
          <p>
            <strong>Pays :</strong> {order.pays}
          </p>
          <p>
            <strong>Adresse :</strong> {order.adresse}
          </p>
          <p>
            <strong>Valeur marchandise :</strong> {order.valeurMarchandise} €
          </p>
          <p>
            <strong>Date de pickup :</strong>{" "}
            {new Date(order.dateDePickup).toLocaleDateString("fr-FR")}
          </p>
          <p>
            <strong>Type de commande :</strong> {order.typeCommande}
          </p>
          <p>
            <strong>Type de transport :</strong> {order.typeTransport}
          </p>
          <p>
            <strong>Incoterm :</strong> {order.ecoterme}
          </p>
          <p>
            <strong>Mode de paiement :</strong> {order.modePaiement}
          </p>
        </CardContent>
      </Card>

      {/* Destinataire */}
      <Card>
        <CardHeader>
          <CardTitle>Destinataire</CardTitle>
          <CardDescription>Informations de livraison</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Nom :</strong> {order.nomDestinataire}
          </p>
          <p>
            <strong>Pays :</strong> {order.paysDestinataire}
          </p>
          <p>
            <strong>Adresse :</strong> {order.adresseDestinataire}
          </p>
          <p>
            <strong>Téléphone :</strong> {order.indicatifTelephoneDestinataire}{" "}
            {order.telephoneDestinataire}
          </p>
          <p>
            <strong>Email :</strong> {order.emailDestinataire}
          </p>
        </CardContent>
      </Card>
      {/* Produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
          <CardDescription>
            Liste des produits de votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.produits && order.produits.length > 0 ? (
                order.produits.map((product: any) => (
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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

      {/* Info supplémentaire */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <CardTitle>Commande validée</CardTitle>
              <CardDescription>
                Votre commande a été acceptée et sera bientôt préparée.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p>
            Merci de votre confiance ! Notre équipe vous tiendra informé du
            suivi de la livraison.
          </p>
          <Separator className="my-4" />
          <p>
            Pour toute question, contactez-nous au +216 99 99 99 99 ou par email
            support@cargo.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
