"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, CreditCard, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

import { PayeeFactureView } from "@/components/payee-facture-view"
import { EnAttenteFactureView } from "@/components/en-attente-facture-view"
import { EnRetardFactureView } from "@/components/en-retard-facture-view"

interface Invoice {
  id: string
  numeroFacture: number
  document: string | null
  montant: number
  dateEmission: string
  status: string
  commande: {
    id: string
    nom: string
    produits: any[]
  }
  paiement: {
    id: string
    modePaiement: string
    statut: string
    datePaiement: string | null
  } | null
}

export default function FactureDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const factureId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  const fetchInvoiceDetails = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/factures/${factureId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors du chargement des détails de la facture (${response.status})`)
      }

      const data = await response.json()

      // Format dates
      const formattedInvoice = {
        ...data,
        id: data.id.toString(),
        dateEmission: new Date(data.dateEmission).toLocaleDateString("fr-FR"),
        commande: {
          ...data.commande,
          id: data.commande.id.toString(),
        },
        paiement: data.paiement
          ? {
              ...data.paiement,
              id: data.paiement.id.toString(),
              datePaiement: data.paiement.datePaiement
                ? new Date(data.paiement.datePaiement).toLocaleDateString("fr-FR")
                : null,
            }
          : null,
      }

      setInvoice(formattedInvoice)
    } catch (error) {
      console.error("Error fetching invoice details:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors du chargement des détails de la facture",
      )
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la facture",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [factureId])

  useEffect(() => {
    fetchInvoiceDetails()
  }, [fetchInvoiceDetails])

  const initiatePayment = async () => {
    if (!invoice) return

    setProcessingPayment(true)

    try {
      const response = await fetch("/api/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idFacture: invoice.id,
          modePaiement: "Carte bancaire",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors de l'initiation du paiement (${response.status})`)
      }

      const data = await response.json()

      // Update the invoice locally
      setInvoice({
        ...invoice,
        status: "En cours de paiement",
        paiement: {
          id: data.id.toString(),
          modePaiement: data.modePaiement,
          statut: data.statut,
          datePaiement: null,
        },
      })

      toast({
        title: "Paiement initié",
        description: "Votre paiement a été initié avec succès",
      })
    } catch (error) {
      console.error("Error initiating payment:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'initier le paiement",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
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
            <Button variant="outline" size="sm" onClick={fetchInvoiceDetails}>
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

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <p className="text-xl text-muted-foreground">Facture non trouvée</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/client/factures")}>
          Retour aux factures
        </Button>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (invoice.status) {
      case "Payée":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "En attente":
        return <Clock className="h-5 w-5 text-orange-500" />
      case "En retard":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facture #{invoice.numeroFacture}</h1>
        <div className="flex items-center mt-1 text-muted-foreground">
          {getStatusIcon()}
          <span className="ml-2">
            {invoice.status} • Émise le {invoice.dateEmission}
          </span>
        </div>
      </div>

      {invoice.status === "Payée" && <PayeeFactureView invoice={invoice} />}
      {invoice.status === "En attente" && (
        <EnAttenteFactureView invoice={invoice} onPay={initiatePayment} isProcessing={processingPayment} />
      )}
      {invoice.status === "En retard" && (
        <EnRetardFactureView invoice={invoice} onPay={initiatePayment} isProcessing={processingPayment} />
      )}
      {invoice.status === "En cours de paiement" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <CreditCard className="mr-2 h-5 w-5" />
              Paiement en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Votre paiement est en cours de traitement. Veuillez patienter pendant que nous vérifions votre
              transaction.
            </p>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Le statut de votre paiement sera mis à jour automatiquement une fois la transaction confirmée.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard/client/factures")}>
              Retour aux factures
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
