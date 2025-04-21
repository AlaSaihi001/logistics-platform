"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Calendar, CheckCircle, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

// Données fictives pour un ticket de support
const getTicketDetails = (id: string) => {
  return {
    id,
    sujet: "Problème de livraison",
    client: {
      nom: "TechGlobal",
      id: "CLI-2023-042",
      email: "contact@techglobal.com",
      avatar: "/placeholder.svg",
    },
    dateCreation: "15/03/2023 14:30",
    status: "en-attente",
    description:
      "Bonjour, nous avons un problème avec notre dernière livraison (commande CMD-2023-056). Le colis est arrivé endommagé et certains composants sont inutilisables. Pouvez-vous nous aider à résoudre ce problème rapidement ? Nous avons besoin de ces composants pour honorer nos engagements auprès de nos clients. Merci d'avance pour votre aide.",
    documents: [
      { nom: "Photo_colis_endommagé.jpg", taille: "2.4 MB", url: "/document-sample.pdf" },
      { nom: "Bon_de_livraison.pdf", taille: "1.2 MB", url: "/document-sample.pdf" },
    ],
    historique: [
      {
        date: "15/03/2023 14:30",
        auteur: "TechGlobal",
        message:
          "Bonjour, nous avons un problème avec notre dernière livraison (commande CMD-2023-056). Le colis est arrivé endommagé et certains composants sont inutilisables. Pouvez-vous nous aider à résoudre ce problème rapidement ? Nous avons besoin de ces composants pour honorer nos engagements auprès de nos clients. Merci d'avance pour votre aide.",
        estClient: true,
      },
      {
        date: "15/03/2023 16:45",
        auteur: "Sophie Martin",
        message:
          "Bonjour, je suis désolée pour ce désagrément. Pouvez-vous me préciser quels composants sont endommagés et me fournir des photos supplémentaires ? Je vais contacter notre service logistique pour voir comment nous pouvons résoudre ce problème au plus vite.",
        estClient: false,
      },
      {
        date: "16/03/2023 09:15",
        auteur: "TechGlobal",
        message:
          "Bonjour Sophie, merci pour votre réponse rapide. Les composants endommagés sont les processeurs (5 unités) et les cartes mères (3 unités). Je vous envoie des photos supplémentaires en pièce jointe. Notre référence client est CLI-2023-042.",
        estClient: true,
      },
    ],
  }
}

export default function TicketDetailsPage() {
  const params = useParams()
  const ticketId = params.id as string
  const ticket = getTicketDetails(ticketId)

  const [status, setStatus] = useState(ticket.status)
  const [reponse, setReponse] = useState("")
  const [historique, setHistorique] = useState(ticket.historique)

  const handleMarkAsResolved = () => {
    setStatus("resolu")
  }

  const handleSendResponse = () => {
    if (reponse.trim()) {
      const newMessage = {
        date: new Date().toLocaleString("fr-FR"),
        auteur: "Sophie Martin",
        message: reponse,
        estClient: false,
      }
      setHistorique([...historique, newMessage])
      setReponse("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/assistant/support">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{ticketId}</h1>
            <StatusBadge status={status as any} className="ml-2" />
          </div>
          <p className="text-muted-foreground mt-1">
            {ticket.sujet} - {ticket.client.nom}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "en-attente" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marquer comme résolu
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Marquer comme résolu</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir marquer ce ticket comme résolu ? Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkAsResolved} className="bg-green-600 hover:bg-green-700">
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des échanges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {historique.map((message, index) => (
                <div key={index} className={`flex gap-4 ${message.estClient ? "" : "flex-row-reverse"}`}>
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarImage
                      src={message.estClient ? ticket.client.avatar : "/placeholder.svg"}
                      alt={message.auteur}
                    />
                    <AvatarFallback>{message.auteur.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 space-y-2 ${message.estClient ? "" : "items-end text-right"}`}>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${message.estClient ? "" : "ml-auto"}`}>{message.auteur}</p>
                      <span className="text-xs text-muted-foreground">{message.date}</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.estClient ? "bg-muted/50 text-foreground" : "bg-primary/10 text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            {status === "en-attente" && (
              <CardFooter className="flex-col items-start gap-4">
                <div className="w-full">
                  <Textarea
                    placeholder="Répondre au client..."
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end gap-2 w-full">
                  <Button variant="outline" className="gap-2">
                    <Paperclip className="h-4 w-4" />
                    Joindre un fichier
                  </Button>
                  <Button onClick={handleSendResponse} disabled={!reponse.trim()} className="gap-2">
                    <Send className="h-4 w-4" />
                    Envoyer
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">ID du ticket</p>
                <p className="font-medium">{ticketId}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sujet</p>
                <p className="font-medium">{ticket.sujet}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Client</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ticket.client.avatar} alt={ticket.client.nom} />
                    <AvatarFallback>{ticket.client.nom.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{ticket.client.nom}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">ID Client</p>
                <p className="font-medium">{ticket.client.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date de création</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {ticket.dateCreation}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Statut</p>
                <StatusBadge status={status as any} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents associés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticket.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.nom}</p>
                        <p className="text-xs text-muted-foreground">{doc.taille}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <Link href={doc.url} target="_blank">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Télécharger</span>
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
