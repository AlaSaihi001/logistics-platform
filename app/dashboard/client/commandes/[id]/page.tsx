"use client"

import Link from "next/link"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { LivreeOrderView } from "@/components/livree-order-view"
import { ExpedieeOrderView } from "@/components/expediee-order-view"
import { EnAttenteOrderView } from "@/components/en-attente-order-view"
import { AnnuleeOrderView } from "@/components/annulee-order-view"
import { ArchiveeOrderView } from "@/components/archivee-order-view"

interface Order {
  id: string
  nom: string
  pays: string
  adresse: string
  dateDePickup: string
  valeurMarchandise: number
  typeCommande: string
  typeTransport: string
  ecoterme: string
  modePaiement: string
  nomDestinataire: string
  paysDestinataire: string
  adresseDestinataire: string
  indicatifTelephoneDestinataire: string
  telephoneDestinataire: number
  emailDestinataire: string
  status: string
  adresseActuel: string
  produits: any[]
  factures: any[]
  createdAt: string
  updatedAt: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [cancellingOrder, setCancellingOrder] = useState(false)

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/commandes/${orderId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors du chargement des détails de la commande (${response.status})`)
      }

      const data = await response.json()

      // Format dates
      const formattedOrder = {
        ...data,
        dateDePickup: new Date(data.dateDePickup).toLocaleDateString("fr-FR"),
        createdAt: new Date(data.createdAt).toLocaleDateString("fr-FR"),
        updatedAt: new Date(data.updatedAt).toLocaleDateString("fr-FR"),
        factures: data.factures.map((facture: any) => ({
          ...facture,
          dateEmission: new Date(facture.dateEmission).toLocaleDateString("fr-FR"),
        })),
      }

      setOrder(formattedOrder)
    } catch (error) {
      console.error("Error fetching order details:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors du chargement des détails de la commande",
      )
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la commande",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrderDetails()
  }, [fetchOrderDetails])

  const handleCancelOrder = async () => {
    if (!order) return

    setCancellingOrder(true)

    try {
      const response = await fetch(`/api/commandes/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors de l'annulation de la commande (${response.status})`)
      }

      // Update the order status locally
      setOrder({
        ...order,
        status: "Annulée",
      })

      toast({
        title: "Commande annulée",
        description: "La commande a été annulée avec succès",
      })
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande",
        variant: "destructive",
      })
    } finally {
      setCancellingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[200px] rounded-lg" />
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchOrderDetails}>
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>

        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <p className="text-xl text-muted-foreground">Commande non trouvée</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/client/commandes")}>
          Retour aux commandes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Commande #{order.id} - {order.nom}
        </h1>
        <p className="text-muted-foreground">
          Créée le {order.createdAt} • Dernière mise à jour le {order.updatedAt}
        </p>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="tracking">Suivi</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {order.factures.length > 0 && <TabsTrigger value="factures">Factures</TabsTrigger>}
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          {order.status === "Livrée" && <LivreeOrderView order={order} />}
          {order.status === "Expédiée" && <ExpedieeOrderView order={order} />}
          {order.status === "En attente" && (
            <EnAttenteOrderView order={order} onCancel={handleCancelOrder} isCancelling={cancellingOrder} />
          )}
          {order.status === "Annulée" && <AnnuleeOrderView order={order} />}
          {order.status === "Archivée" && <ArchiveeOrderView order={order} />}
        </TabsContent>
        <TabsContent value="tracking">
          {/* Tracking content will be implemented in a future update */}
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">Suivi de la commande</h3>
            <p className="mt-2 text-muted-foreground">
              Le suivi détaillé de cette commande sera disponible prochainement.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="documents">
          {/* Documents content will be implemented in a future update */}
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">Documents</h3>
            <p className="mt-2 text-muted-foreground">
              Les documents relatifs à cette commande seront disponibles prochainement.
            </p>
          </div>
        </TabsContent>
        {order.factures.length > 0 && (
          <TabsContent value="factures">
            <div className="space-y-4">
              {order.factures.map((facture) => (
                <div key={facture.id} className="rounded-lg border p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Facture #{facture.numeroFacture}</h3>
                      <p className="text-muted-foreground">Émise le {facture.dateEmission}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{facture.montant.toLocaleString()} €</p>
                      <p
                        className={`text-sm ${
                          facture.status === "Payée"
                            ? "text-green-600"
                            : facture.status === "En retard"
                              ? "text-red-600"
                              : "text-orange-600"
                        }`}
                      >
                        {facture.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/client/factures/${facture.id}`}>Voir détails</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
