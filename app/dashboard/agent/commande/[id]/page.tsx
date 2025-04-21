"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Download,
  FileText,
  Check,
  X,
  Building,
  Truck,
  Calendar,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Upload,
  Send,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// Données fictives pour une commande
const getCommandeDetails = (id: string) => {
  return {
    id,
    client: {
      nom: "TechGlobal",
      adresse: "123 Avenue de la Technologie, 75001 Paris, France",
      email: "contact@techglobal.com",
      telephone: "+33 1 23 45 67 89",
    },
    nom: "Import matériel informatique",
    adresseDepart: "Shanghai International Logistics Center, 200 Shipping Road, Shanghai, Chine",
    adresseDestination: "TechGlobal Warehouse, 123 Avenue de la Technologie, 75001 Paris, France",
    dateCommande: "15/03/2023",
    modeTransport: "Maritime",
    valeurMarchandise: 25000.0,
    status: "en-attente",
    documents: [
      { id: "DOC-2023-045", nom: "Facture commerciale", type: "pdf" },
      { id: "DOC-2023-046", nom: "Certificat d'origine", type: "pdf" },
      { id: "DOC-2023-047", nom: "Liste de colisage", type: "pdf" },
    ],
    produits: [
      {
        id: "PROD-001",
        nom: "Ordinateur portable",
        quantite: 50,
        prixUnitaire: 400.0,
        poids: "1.5 kg",
        dimensions: "35x25x3 cm",
        documents: ["Certificat de conformité"],
      },
      {
        id: "PROD-002",
        nom: "Écran 24 pouces",
        quantite: 30,
        prixUnitaire: 200.0,
        poids: "3 kg",
        dimensions: "60x40x15 cm",
        documents: ["Certificat de conformité", "Fiche technique"],
      },
      {
        id: "PROD-003",
        nom: "Clavier sans fil",
        quantite: 100,
        prixUnitaire: 30.0,
        poids: "0.5 kg",
        dimensions: "45x15x3 cm",
        documents: ["Certificat de conformité"],
      },
    ],
  }
}

// Fonction pour générer un numéro de facture
const generateInvoiceNumber = () => {
  const prefix = "FAC"
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${year}-${randomNum}`
}

// Fonction pour générer un ID de document
const generateDocumentId = () => {
  const prefix = "DOC"
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${year}-${randomNum}`
}

// Fonction pour calculer le montant HT
const calculateSubtotal = (products) => {
  return products.reduce((total, product) => {
    return total + product.quantite * product.prixUnitaire
  }, 0)
}

// Fonction pour calculer la TVA
const calculateTVA = (subtotal, rate) => {
  return subtotal * (rate / 100)
}

// Fonction pour calculer le total TTC
const calculateTotal = (subtotal, tva) => {
  return subtotal + tva
}

// Fonction pour formater la date au format YYYY-MM-DD
const formatDateForInput = (date) => {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export default function CommandeDetailsPage() {
  const params = useParams()
  const commandeId = params.id as string
  const [commande, setCommande] = useState(getCommandeDetails(commandeId))

  const [status, setStatus] = useState(commande.status)

  const statusSteps = [
    { id: "en-attente", label: "En attente" },
    { id: "acceptee", label: "Acceptée" },
    { id: "expediee", label: "Expédiée" },
    { id: "livree", label: "Livrée" },
  ]

  const currentStepIndex = statusSteps.findIndex((step) => step.id === status)

  const [isRefuseDialogOpen, setIsRefuseDialogOpen] = useState(false)
  const [isFactureDialogOpen, setIsFactureDialogOpen] = useState(false)
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false)
  const [isLocationUpdateDialogOpen, setIsLocationUpdateDialogOpen] = useState(false)
  const [locationUpdate, setLocationUpdate] = useState({
    title: "",
    address: "",
    description: "",
  })
  const [refuseReason, setRefuseReason] = useState("")
  const [refuseComment, setRefuseComment] = useState("")
  const [refuseDocuments, setRefuseDocuments] = useState([])

  // État pour le nouveau document
  const [newDocument, setNewDocument] = useState({
    nom: "",
    type: "pdf",
    fichier: null,
  })

  // État pour le formulaire de facture
  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(today.getDate() + 30) // Date d'échéance par défaut à 30 jours

  const [factureData, setFactureData] = useState({
    numeroFacture: generateInvoiceNumber(),
    dateEmission: formatDateForInput(today),
    dateEcheance: formatDateForInput(dueDate),
    adresseFacturationDifferente: false,
    adresseFacturation: commande.client.adresse,
    montantHT: calculateSubtotal(commande.produits).toFixed(2),
    tauxTVA: 20,
    montantTVA: calculateTVA(calculateSubtotal(commande.produits), 20).toFixed(2),
    montantTTC: calculateTotal(
      calculateSubtotal(commande.produits),
      calculateTVA(calculateSubtotal(commande.produits), 20),
    ).toFixed(2),
    messageDescription: "",
    documentsJoints: [],
    sendEmail: true,
  })

  // Calculs pour la facture
  const subtotal = calculateSubtotal(commande.produits)
  const tva = calculateTVA(subtotal, factureData.tauxTVA)
  const total = calculateTotal(subtotal, tva)

  const handleAcceptCommande = () => {
    setStatus("acceptee")
    // Ici, vous implémenteriez la logique pour accepter la commande
  }

  const handleRefuseCommande = () => {
    setStatus("refusee")
    setIsRefuseDialogOpen(false)
    // Ici, vous implémenteriez la logique pour refuser la commande
    console.log("Commande refusée:", {
      raison: refuseReason,
      commentaire: refuseComment,
      documents: refuseDocuments,
    })
  }

  const handleCreateFacture = () => {
    setIsFactureDialogOpen(false)
    // Ici, vous implémenteriez la logique pour créer une facture
    console.log("Facture créée:", factureData)
  }

  const handleLocationUpdate = () => {
    // Ici, vous implémenteriez la logique pour mettre à jour la localisation
    console.log("Mise à jour de localisation:", locationUpdate)
    setIsLocationUpdateDialogOpen(false)

    // Réinitialiser le formulaire
    setLocationUpdate({
      title: "",
      address: "",
      description: "",
    })
  }

  const handleFactureInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFactureData({
      ...factureData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleLocationInputChange = (e) => {
    const { name, value } = e.target
    setLocationUpdate({
      ...locationUpdate,
      [name]: value,
    })
  }

  const handleNewDocumentChange = (e) => {
    const { name, value, files } = e.target

    if (name === "fichier" && files) {
      setNewDocument({
        ...newDocument,
        fichier: files[0],
      })
    } else {
      setNewDocument({
        ...newDocument,
        [name]: value,
      })
    }
  }

  const handleAddDocument = () => {
    // Ici, vous implémenteriez la logique pour ajouter le document
    const newDoc = {
      id: generateDocumentId(),
      nom: newDocument.nom,
      type: newDocument.type,
    }

    setCommande({
      ...commande,
      documents: [...commande.documents, newDoc],
    })

    // Réinitialiser le formulaire et fermer la boîte de dialogue
    setNewDocument({
      nom: "",
      type: "pdf",
      fichier: null,
    })
    setIsAddDocumentDialogOpen(false)

    console.log("Document ajouté:", newDoc)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/agent/commandes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{commandeId}</h1>
            <StatusBadge status={status as any} className="ml-2" />
          </div>
          <p className="text-muted-foreground mt-1">
            {commande.nom} - {commande.client.nom}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "en-attente" && (
            <>
              <Button
                variant="outline"
                className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                onClick={() => setIsRefuseDialogOpen(true)}
              >
                <X className="h-4 w-4" />
                Refuser
              </Button>
              <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={handleAcceptCommande}>
                <Check className="h-4 w-4" />
                Accepter
              </Button>
            </>
          )}
          {status === "expediee" && (
            <Button variant="outline" className="gap-2 mr-auto" onClick={() => setIsLocationUpdateDialogOpen(true)}>
              <MapPin className="h-4 w-4" />
              Mise à jour localisation
            </Button>
          )}
          {(status === "acceptee" || status === "expediee" || status === "livree") && (
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600" onClick={() => setIsFactureDialogOpen(true)}>
              <FileText className="h-4 w-4" />
              Créer une facture
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5 text-primary" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-lg">{commande.client.nom}</p>
                  <p className="whitespace-pre-line text-muted-foreground">{commande.client.adresse}</p>
                  <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="break-all">{commande.client.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {commande.client.telephone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Détails de la commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Numéro de commande</p>
                    <p className="font-medium">{commandeId}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Date de commande</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {commande.dateCommande}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Mode de transport</p>
                    <p className="font-medium flex items-center gap-1">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      {commande.modeTransport}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Valeur marchandise</p>
                    <p className="font-medium flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {commande.valeurMarchandise.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Suivi de la commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {statusSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index <= currentStepIndex
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < currentStepIndex ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                      </div>
                      <span
                        className={`text-xs mt-1 ${
                          index <= currentStepIndex ? "text-primary font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${currentStepIndex === 0 ? 0 : currentStepIndex === statusSteps.length - 1 ? 100 : (currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 grid-cols-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Adresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium text-base mb-2">Adresse de départ</h3>
                    <p className="whitespace-pre-line text-muted-foreground">{commande.adresseDepart}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium text-base mb-2">Adresse de destination</h3>
                    <p className="whitespace-pre-line text-muted-foreground">{commande.adresseDestination}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {status === "acceptee" && (
            <div className="flex justify-end mt-4">
              <Button className="gap-2 bg-blue-500 hover:bg-blue-600" onClick={() => setStatus("expediee")}>
                <Truck className="h-4 w-4" />
                Marquer comme expédiée
              </Button>
            </div>
          )}
          {status === "expediee" && (
            <div className="flex justify-end mt-4">
              <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={() => setStatus("livree")}>
                <Check className="h-4 w-4" />
                Marquer comme livrée
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="produits">
          <Card>
            <CardHeader>
              <CardTitle>Liste des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="hidden md:table-cell">Poids</TableHead>
                      <TableHead className="hidden md:table-cell">Dimensions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commande.produits.map((produit) => (
                      <TableRow key={produit.id}>
                        <TableCell className="font-medium">{produit.id}</TableCell>
                        <TableCell>{produit.nom}</TableCell>
                        <TableCell className="text-right">{produit.quantite}</TableCell>
                        <TableCell className="text-right">{produit.prixUnitaire.toFixed(2)} €</TableCell>
                        <TableCell className="hidden md:table-cell">{produit.poids}</TableCell>
                        <TableCell className="hidden md:table-cell">{produit.dimensions}</TableCell>
                        <TableCell className="text-right">
                          {produit.documents.length > 0 && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">Documents</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents associés</CardTitle>
                <CardDescription>Documents liés à cette commande</CardDescription>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDocumentDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Ajouter un document
              </Button>
            </CardHeader>
            <CardContent>
              {commande.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">Aucun document associé à cette commande</p>
                  <Button className="mt-4 gap-2" onClick={() => setIsAddDocumentDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Ajouter un document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {commande.documents.map((document) => (
                    <div key={document.id} className="p-4 border rounded-lg flex items-start justify-between">
                      <div>
                        <p className="font-medium">{document.nom}</p>
                        <p className="text-sm text-muted-foreground">{document.id}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Télécharger</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRefuseDialogOpen} onOpenChange={setIsRefuseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Refuser la commande</DialogTitle>
            <DialogDescription>Veuillez indiquer la raison du refus de cette commande.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={refuseReason} onValueChange={setRefuseReason}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="documents_incomplets" id="documents_incomplets" />
                <Label htmlFor="documents_incomplets" className="font-normal">
                  Documents incomplets ou incorrects
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="produits_non_conformes" id="produits_non_conformes" />
                <Label htmlFor="produits_non_conformes" className="font-normal">
                  Produits non conformes aux réglementations
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="transport_impossible" id="transport_impossible" />
                <Label htmlFor="transport_impossible" className="font-normal">
                  Transport impossible vers la destination
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="autre" id="autre" />
                <Label htmlFor="autre" className="font-normal">
                  Autre raison
                </Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
              <Textarea
                id="commentaire"
                placeholder="Ajoutez des détails supplémentaires..."
                value={refuseComment}
                onChange={(e) => setRefuseComment(e.target.value)}
              />
            </div>

            {/* Nouvelle section pour les documents */}
            <div className="space-y-2 pt-2">
              <Label>Documents justificatifs (optionnel)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Joignez des documents justifiant le refus</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Parcourir les fichiers
                </Button>
                {refuseDocuments.length > 0 && (
                  <div className="mt-3 text-left">
                    <p className="text-sm font-medium">Documents sélectionnés:</p>
                    <ul className="text-sm mt-1">
                      {refuseDocuments.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between py-1">
                          <span className="truncate">{doc.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newDocs = [...refuseDocuments]
                              newDocs.splice(index, 1)
                              setRefuseDocuments(newDocs)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefuseDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRefuseCommande} disabled={!refuseReason}>
              Refuser la commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFactureDialogOpen} onOpenChange={setIsFactureDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une facture</DialogTitle>
            <DialogDescription>Créez une facture pour la commande {commandeId}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Section Informations Client */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations client</h3>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nom du client:</span>
                    <span className="font-medium">{commande.client.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-medium">{commande.client.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Téléphone:</span>
                    <span className="font-medium">{commande.client.telephone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adresseFacturationDifferente"
                  name="adresseFacturationDifferente"
                  checked={factureData.adresseFacturationDifferente}
                  onCheckedChange={(checked) =>
                    setFactureData({
                      ...factureData,
                      adresseFacturationDifferente: checked,
                    })
                  }
                />
                <Label htmlFor="adresseFacturationDifferente">Adresse de facturation différente</Label>
              </div>

              {factureData.adresseFacturationDifferente && (
                <div className="space-y-2">
                  <Label htmlFor="adresseFacturation">Adresse de facturation</Label>
                  <Textarea
                    id="adresseFacturation"
                    name="adresseFacturation"
                    value={factureData.adresseFacturation}
                    onChange={handleFactureInputChange}
                    placeholder="Saisissez l'adresse de facturation"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Section Informations Facture */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-lg font-medium pt-2">Informations de facture</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroFacture">Numéro de facture</Label>
                  <Input
                    id="numeroFacture"
                    name="numeroFacture"
                    value={factureData.numeroFacture}
                    onChange={handleFactureInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateEmission">Date d'émission</Label>
                  <Input
                    type="date"
                    id="dateEmission"
                    name="dateEmission"
                    value={factureData.dateEmission}
                    onChange={handleFactureInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateEcheance">Date d'échéance</Label>
                  <Input
                    type="date"
                    id="dateEcheance"
                    name="dateEcheance"
                    value={factureData.dateEcheance}
                    onChange={handleFactureInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tauxTVA">Taux de TVA (%)</Label>
                  <Select
                    value={factureData.tauxTVA.toString()}
                    onValueChange={(value) => setFactureData({ ...factureData, tauxTVA: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="tauxTVA">
                      <SelectValue placeholder="Sélectionner un taux de TVA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="5.5">5.5%</SelectItem>
                      <SelectItem value="0">0% (Exonéré)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messageDescription">Message ou note (optionnel)</Label>
                <Textarea
                  id="messageDescription"
                  name="messageDescription"
                  value={factureData.messageDescription}
                  onChange={handleFactureInputChange}
                  placeholder="Ajoutez un message ou une note pour le client..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Documents à joindre (optionnel)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Glissez-déposez des fichiers ici ou cliquez pour parcourir
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Parcourir les fichiers
                  </Button>
                </div>
              </div>
            </div>

            {/* Section Récapitulatif des montants */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-lg font-medium pt-2">Récapitulatif des montants</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="montantHT">Montant HT (€)</Label>
                  <Input
                    id="montantHT"
                    name="montantHT"
                    type="number"
                    step="0.01"
                    value={factureData.montantHT}
                    onChange={handleFactureInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tauxTVA">Taux de TVA (%)</Label>
                  <Select
                    value={factureData.tauxTVA.toString()}
                    onValueChange={(value) => {
                      const taux = Number.parseInt(value)
                      const ht = Number.parseFloat(factureData.montantHT)
                      const tva = ((ht * taux) / 100).toFixed(2)
                      const ttc = (ht + Number.parseFloat(tva)).toFixed(2)

                      setFactureData({
                        ...factureData,
                        tauxTVA: taux,
                        montantTVA: tva,
                        montantTTC: ttc,
                      })
                    }}
                  >
                    <SelectTrigger id="tauxTVA">
                      <SelectValue placeholder="Sélectionner un taux de TVA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="5.5">5.5%</SelectItem>
                      <SelectItem value="0">0% (Exonéré)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montantTVA">Montant TVA (€)</Label>
                  <Input
                    id="montantTVA"
                    name="montantTVA"
                    type="number"
                    step="0.01"
                    value={factureData.montantTVA}
                    onChange={(e) => {
                      const tva = e.target.value
                      const ht = Number.parseFloat(factureData.montantHT)
                      const ttc = (ht + Number.parseFloat(tva)).toFixed(2)

                      setFactureData({
                        ...factureData,
                        montantTVA: tva,
                        montantTTC: ttc,
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montantTTC">Total TTC (€)</Label>
                  <Input
                    id="montantTTC"
                    name="montantTTC"
                    type="number"
                    step="0.01"
                    value={factureData.montantTTC}
                    onChange={handleFactureInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Section Options d'envoi */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-lg font-medium pt-2">Options d'envoi</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  name="sendEmail"
                  checked={factureData.sendEmail}
                  onCheckedChange={(checked) =>
                    setFactureData({
                      ...factureData,
                      sendEmail: checked,
                    })
                  }
                />
                <Label htmlFor="sendEmail">Envoyer la facture par email au client</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFactureDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFacture} className="gap-2 bg-blue-500 hover:bg-blue-600">
              {factureData.sendEmail ? (
                <>
                  <Send className="h-4 w-4" />
                  Enregistrer et envoyer
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Enregistrer la facture
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour ajouter un document */}
      <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>Ajoutez un nouveau document à cette commande.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du document</Label>
              <Input
                id="nom"
                name="nom"
                value={newDocument.nom}
                onChange={handleNewDocumentChange}
                placeholder="Ex: Facture commerciale, Certificat d'origine..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de document</Label>
              <Select
                value={newDocument.type}
                onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">DOC/DOCX</SelectItem>
                  <SelectItem value="xls">XLS/XLSX</SelectItem>
                  <SelectItem value="jpg">JPG/JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fichier">Fichier</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Glissez-déposez un fichier ici ou cliquez pour parcourir
                </p>
                <Input id="fichier" name="fichier" type="file" className="hidden" onChange={handleNewDocumentChange} />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => document.getElementById("fichier").click()}
                >
                  Parcourir les fichiers
                </Button>
                {newDocument.fichier && (
                  <p className="mt-2 text-sm font-medium">Fichier sélectionné: {newDocument.fichier.name}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDocumentDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddDocument} disabled={!newDocument.nom || !newDocument.fichier} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour la mise à jour de localisation */}
      <Dialog open={isLocationUpdateDialogOpen} onOpenChange={setIsLocationUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mise à jour de localisation</DialogTitle>
            <DialogDescription>Mettez à jour la localisation actuelle de cette commande.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la mise à jour</Label>
              <Input
                id="title"
                name="title"
                value={locationUpdate.title}
                onChange={handleLocationInputChange}
                placeholder="Ex: Arrivée à l'entrepôt de Paris"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse de localisation actuelle</Label>
              <Textarea
                id="address"
                name="address"
                value={locationUpdate.address}
                onChange={handleLocationInputChange}
                placeholder="Adresse complète où se trouve actuellement la commande"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                name="description"
                value={locationUpdate.description}
                onChange={handleLocationInputChange}
                placeholder="Informations supplémentaires sur la localisation ou l'état de la commande..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationUpdateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleLocationUpdate}
              disabled={!locationUpdate.title || !locationUpdate.address}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Mettre à jour la localisation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
