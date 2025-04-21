"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle } from "lucide-react"
import { OrderDetails } from "@/components/order-details"
import { SupplierRecipient } from "@/components/supplier-recipient"
import { ProductList } from "@/components/product-list"

interface EnAttenteOrderViewProps {
  order: any
  onCancel: () => Promise<void>
  isCancelling?: boolean
}

export function EnAttenteOrderView({ order, onCancel, isCancelling = false }: EnAttenteOrderViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1 px-3 py-1"
        >
          <Clock className="h-4 w-4" />
          <span>En attente de traitement</span>
        </Badge>
        <Button variant="destructive" onClick={onCancel} disabled={isCancelling}>
          {isCancelling ? "Annulation en cours..." : "Annuler la commande"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la commande</CardTitle>
          <CardDescription>Informations générales sur votre commande</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderDetails order={order} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fournisseur</CardTitle>
            <CardDescription>Informations sur l'expéditeur</CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierRecipient name={order.nom} country={order.pays} address={order.adresse} type="supplier" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinataire</CardTitle>
            <CardDescription>Informations sur le destinataire</CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierRecipient
              name={order.nomDestinataire}
              country={order.paysDestinataire}
              address={order.adresseDestinataire}
              phone={`${order.indicatifTelephoneDestinataire} ${order.telephoneDestinataire}`}
              email={order.emailDestinataire}
              type="recipient"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
          <CardDescription>Liste des produits de votre commande</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductList products={order.produits} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-orange-50 border-b">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <CardTitle>Informations importantes</CardTitle>
              <CardDescription>À propos de votre commande en attente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p>
              Votre commande est actuellement en attente de traitement. Un agent va bientôt la prendre en charge et vous
              serez notifié dès que son statut changera.
            </p>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Prochaines étapes :</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Vérification et validation de votre commande par notre équipe</li>
                <li>Préparation de votre expédition</li>
                <li>Envoi de la commande</li>
                <li>Suivi de la livraison</li>
              </ol>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Besoin d'aide ?</h4>
              <p>
                Si vous avez des questions concernant votre commande, n'hésitez pas à contacter notre service client au
                +216 99 99 99 99 ou par email à support@cargo.com.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
