"use client"

import { Download, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface FactureItem {
  name: string
  quantity: number
  price: number
}

interface FactureDetails {
  id: string
  date: string
  amount: number
  status: string
  paymentMethod: string
  paymentDate: string
  transactionId: string
  items: FactureItem[]
  clientInfo: {
    name: string
    address: string
    email: string
  }
  companyInfo: {
    name: string
    address: string
    taxId: string
  }
}

interface PayeeFactureViewProps {
  factureDetails: FactureDetails
}

export function PayeeFactureView({ factureDetails }: PayeeFactureViewProps) {
  const handleDownloadPDF = () => {
    toast({
      title: "Téléchargement démarré",
      description: `La facture ${factureDetails.id} est en cours de téléchargement.`,
    })
  }

  const handlePrint = () => {
    toast({
      title: "Impression",
      description: "Préparation de l'impression...",
    })
    window.print()
  }

  const handleShare = () => {
    toast({
      title: "Partage",
      description: "Fonctionnalité de partage en cours de développement.",
    })
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Facture {factureDetails.id}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>

      <div className="print:block print:my-8 hidden">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">{factureDetails.companyInfo.name}</h1>
            <p className="text-muted-foreground">{factureDetails.companyInfo.address}</p>
            <p className="text-muted-foreground">N° TVA: {factureDetails.companyInfo.taxId}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">FACTURE</h2>
            <p className="text-muted-foreground">N° {factureDetails.id}</p>
            <p className="text-muted-foreground">Date: {factureDetails.date}</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="font-semibold">Facturé à:</h3>
          <p>{factureDetails.clientInfo.name}</p>
          <p>{factureDetails.clientInfo.address}</p>
          <p>{factureDetails.clientInfo.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Informations de facturation</span>
            <Badge variant="success">Payée</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Numéro de facture:</span>
                <span>{factureDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date d'émission:</span>
                <span>{factureDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Montant total:</span>
                <span className="font-semibold">{factureDetails.amount.toFixed(2)} €</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Mode de paiement:</span>
                <span>{factureDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date de paiement:</span>
                <span>{factureDetails.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ID de transaction:</span>
                <span className="font-mono text-sm">{factureDetails.transactionId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Articles facturés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix unitaire (€)</TableHead>
                <TableHead className="text-right">Total (€)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factureDetails.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price.toFixed(2)} €</TableCell>
                  <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)} €</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Sous-total
                </TableCell>
                <TableCell className="text-right font-medium">
                  {factureDetails.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  TVA (20%)
                </TableCell>
                <TableCell className="text-right font-medium">
                  {(factureDetails.items.reduce((sum, item) => sum + item.quantity * item.price, 0) * 0.2).toFixed(2)} €
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">{factureDetails.amount.toFixed(2)} €</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <Badge variant="success">Payée</Badge>
              <span className="font-medium">Paiement reçu le {factureDetails.paymentDate}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Merci pour votre paiement. Cette facture a été entièrement réglée.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Méthode de paiement:</span>
              <span>{factureDetails.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID de transaction:</span>
              <span className="font-mono text-sm">{factureDetails.transactionId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="print:hidden" />

      <div className="print:hidden text-sm text-muted-foreground">
        <p>
          Pour toute question concernant cette facture, veuillez contacter notre service client à
          support@logisticsplatform.com ou au +33 1 23 45 67 89.
        </p>
      </div>
    </div>
  )
}
