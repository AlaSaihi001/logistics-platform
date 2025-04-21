"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Send, Paperclip, Download, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

// Types pour les tickets et les messages
interface Ticket {
  id: string
  subject: string
  status: string
  date: string
  description: string
  attachments: Attachment[]
}

interface Attachment {
  id: string
  name: string
  size: string
  type: string
}

interface Message {
  id: string
  sender: "client" | "assistant"
  content: string
  timestamp: string
  attachments: Attachment[]
}

// Données fictives pour le ticket
const ticketData: Record<string, Ticket> = {
  "TIC-001": {
    id: "TIC-001",
    subject: "Problème de paiement",
    status: "Ouvert",
    date: "2025-02-15",
    description:
      "Je n'arrive pas à effectuer le paiement de ma commande CMD-1234. J'ai essayé plusieurs cartes bancaires mais je reçois toujours un message d'erreur. Pouvez-vous m'aider à résoudre ce problème ?",
    attachments: [{ id: "att-1", name: "capture_erreur.png", size: "1.2 MB", type: "image/png" }],
  },
  "TIC-002": {
    id: "TIC-002",
    subject: "Retard de livraison",
    status: "En cours",
    date: "2025-02-14",
    description:
      "Ma commande CMD-1156 devait être livrée le 10 février, mais je n'ai toujours rien reçu. Pouvez-vous me donner des informations sur l'état de ma livraison ?",
    attachments: [],
  },
  "TIC-003": {
    id: "TIC-003",
    subject: "Question sur la facturation",
    status: "Résolu",
    date: "2025-02-13",
    description:
      "Je ne comprends pas certains frais sur ma facture FAC-789. Pourriez-vous me détailler les frais de manutention et de douane ?",
    attachments: [{ id: "att-2", name: "facture.pdf", size: "320 KB", type: "application/pdf" }],
  },
}

// Messages fictifs pour les tickets
const messageData: Record<string, Message[]> = {
  "TIC-001": [],
  "TIC-002": [
    {
      id: "msg-1",
      sender: "assistant",
      content:
        "Bonjour, nous avons vérifié votre commande et constaté un retard chez notre transporteur. Votre colis est actuellement en transit et devrait être livré dans les 48 heures. Nous vous présentons nos excuses pour ce désagrément.",
      timestamp: "2025-02-15T10:30:00",
      attachments: [],
    },
  ],
  "TIC-003": [
    {
      id: "msg-2",
      sender: "assistant",
      content:
        "Bonjour, les frais de manutention correspondent à la préparation spéciale de votre colis fragile. Les frais de douane sont calculés selon la réglementation du pays de destination. Vous trouverez ci-joint le détail de ces frais.",
      timestamp: "2025-02-14T09:15:00",
      attachments: [{ id: "att-3", name: "detail_frais.pdf", size: "150 KB", type: "application/pdf" }],
    },
    {
      id: "msg-3",
      sender: "client",
      content: "Merci pour ces précisions, c'est beaucoup plus clair maintenant.",
      timestamp: "2025-02-14T11:45:00",
      attachments: [],
    },
  ],
}

export default function TicketDetailsPage() {
  const { id } = useParams()
  const ticketId = Array.isArray(id) ? id[0] : id

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Simuler un appel API pour récupérer les données du ticket
    if (ticketId && ticketData[ticketId]) {
      setTicket(ticketData[ticketId])
      setMessages(messageData[ticketId] || [])
    }
  }, [ticketId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() && attachments.length === 0) {
      toast({
        title: "Message vide",
        description: "Veuillez saisir un message ou joindre un fichier.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simuler l'envoi du message
    setTimeout(() => {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "client",
        content: newMessage,
        timestamp: new Date().toISOString(),
        attachments: attachments.map((file, index) => ({
          id: `new-att-${index}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          type: file.type,
        })),
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")
      setAttachments([])
      setIsLoading(false)

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      })
    }, 1000)
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p>Ticket non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <a href="/dashboard/client/support">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Détails du ticket</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ticket #{ticket.id} • Créé le {format(new Date(ticket.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <Badge
                  variant={
                    ticket.status === "Ouvert" ? "default" : ticket.status === "En cours" ? "secondary" : "success"
                  }
                >
                  {ticket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Détails du ticket</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-line">{ticket.description}</p>
                </div>

                {ticket.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Pièces jointes</h4>
                    <div className="space-y-2">
                      {ticket.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span>{attachment.name}</span>
                            <span className="text-xs text-muted-foreground">({attachment.size})</span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {messages.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Échanges</h3>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg ${
                          message.sender === "assistant" ? "bg-primary/10 ml-6" : "bg-muted mr-6"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{message.sender === "assistant" ? "Support" : "Vous"}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), "d MMM yyyy à HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className="whitespace-pre-line">{message.content}</p>

                        {message.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="space-y-2">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between bg-background/80 p-2 rounded-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{attachment.name}</span>
                                    <span className="text-xs text-muted-foreground">({attachment.size})</span>
                                  </div>
                                  <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Aucune réponse pour le moment</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Écrivez votre réponse ici..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input id="attachments" type="file" onChange={handleFileChange} multiple className="max-w-md" />
                    <Button type="submit" disabled={isLoading}>
                      <Send className="h-4 w-4 mr-2" />
                      {isLoading ? "Envoi..." : "Envoyer"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: PDF, PNG, JPG, JPEG • Taille max: 10 MB
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Statut</h3>
                <Badge
                  variant={
                    ticket.status === "Ouvert" ? "default" : ticket.status === "En cours" ? "secondary" : "success"
                  }
                  className="w-full justify-center py-1"
                >
                  {ticket.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Créé le</h3>
                <p className="text-sm">{format(new Date(ticket.date), "d MMMM yyyy", { locale: fr })}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Dernière mise à jour</h3>
                <p className="text-sm">
                  {messages.length > 0
                    ? format(new Date(messages[messages.length - 1].timestamp), "d MMMM yyyy à HH:mm", { locale: fr })
                    : format(new Date(ticket.date), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Temps de réponse estimé</h3>
                <p className="text-sm">24-48 heures</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Besoin d'aide urgente?</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">support@logitech.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
