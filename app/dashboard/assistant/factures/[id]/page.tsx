"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Receipt, Download, Send, Building, CreditCard, Mail, Phone, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Données fictives pour une facture
const getFactureDetails = (id: string) => {
  return {
    id,
    commande: "CMD-2023-042",
    client: {
      nom: "TechGlobal",
      adresse: "123 Avenue de la Technologie, 75001 Paris, France",
      email: "finance@techglobal.com",
      telephone: "+33 1 23 45 67 89",
    },
    montantHT: 1250.0,
    tva: 250.0,
    montantTTC: 1500.0,
    dateEmission: "15/03/2023",
    dateEcheance: "15/04/2023",
    status: "non-envoyee",
    modePaiement: "Virement bancaire",
    coordonneesBancaires: {
      iban: "FR76 1234 5678 9012 3456 7890 123",
      bic: "ABCDEFGHIJK",
      banque: "Banque Internationale",
    },
    lignes: [
      { description: "Transport maritime - Conteneur 20'", quantite: 1, prixUnitaire: 800.0, montant: 800.0 },
      { description: "Frais de manutention", quantite: 1, prixUnitaire: 250.0, montant: 250.0 },
      { description: "Assurance transport", quantite: 1, prixUnitaire: 200.0, montant: 200.0 },
    ],
    pdfUrl: "/document-sample.pdf",
  }
}

export default function FactureDetailsPage() {
  const params = useParams()
  const factureId = params.id as string
  const facture = getFactureDetails(factureId)

  const [status, setStatus] = useState(facture.status)
  const [message, setMessage] = useState("")

  const handleSendInvoice = () => {
    setStatus("envoyee")
    // Ici, vous implémenteriez la logique pour envoyer la facture
    alert(`Facture ${factureId} envoyée au client`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/assistant/factures">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{factureId}</h1>
            <StatusBadge status={status as any} className="ml-2" />
          </div>
          <p className="text-muted-foreground mt-1">
            Commande{" "}
            <Link href={`/dashboard/assistant/commande/${facture.commande}`} className="text-blue-600 hover:underline">
              {facture.commande}
            </Link>{" "}
            - {facture.client.nom}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 w-full sm:w-auto" asChild>
            <Link href={facture.pdfUrl} target="_blank">
              <Download className="h-4 w-4" />
              Télécharger PDF
            </Link>
          </Button>

          {status === "non-envoyee" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="gap-2 bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  Envoyer au client
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Envoyer la facture</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir envoyer la facture {factureId} au client {facture.client.nom} ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendInvoice} className="bg-blue-600 hover:bg-blue-700">
                    Envoyer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Aperçu de la facture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white">
                <iframe src={facture.pdfUrl} className="w-full h-[600px]" title={`Facture ${factureId}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-primary" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-lg">{facture.client.nom}</p>
                <p className="whitespace-pre-line text-muted-foreground">{facture.client.adresse}</p>
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="break-all">{facture.client.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {facture.client.telephone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />
                Détails de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Numéro de facture</p>
                  <p className="font-medium">{factureId}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Commande</p>
                  <p className="font-medium">{facture.commande}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Date d'émission</p>
                  <p className="font-medium">{facture.dateEmission}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Date d'échéance</p>
                  <p className="font-medium">{facture.dateEcheance}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <StatusBadge status={status as any} />
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Mode de paiement</p>
                  <p className="font-medium">{facture.modePaiement}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between">
                  <span>Montant HT</span>
                  <span>{facture.montantHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{facture.tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                  <span>Total TTC</span>
                  <span>{facture.montantTTC.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Coordonnées bancaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">IBAN</p>
                <p className="font-mono font-medium break-all">{facture.coordonneesBancaires.iban}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">BIC</p>
                <p className="font-mono font-medium">{facture.coordonneesBancaires.bic}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Banque</p>
                <p className="font-medium">{facture.coordonneesBancaires.banque}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {status === "non-envoyee" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Message d'envoi</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="mb-2">Message à envoyer avec la facture (optionnel)</p>
              <Textarea
                placeholder="Bonjour, veuillez trouver ci-joint la facture pour votre commande..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                  <Send className="h-4 w-4" />
                  Envoyer au client
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Envoyer la facture</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir envoyer la facture {factureId} au client {facture.client.nom} ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendInvoice} className="bg-blue-600 hover:bg-blue-700">
                    Envoyer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
