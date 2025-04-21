"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Send, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Types pour la réclamation et la commande
interface Claim {
  orderId: string
  claimType: string
  description: string
  attachments: File[]
}

interface Order {
  id: string
  number: string
}

const supportTickets = [
  { id: "TIC-001", date: "2025-02-15", subject: "Problème de paiement", status: "Ouvert" },
  { id: "TIC-002", date: "2025-02-14", subject: "Retard de livraison", status: "En cours" },
  { id: "TIC-003", date: "2025-02-13", subject: "Question sur la facturation", status: "Résolu" },
]

const claimsHistory = [
  { id: "REC-001", date: "2025-02-10", orderId: "CMD-1234", type: "Produit endommagé", status: "En cours" },
  { id: "REC-002", date: "2025-01-25", orderId: "CMD-1156", type: "Produit manquant", status: "Résolu" },
  { id: "REC-003", date: "2025-01-15", orderId: "CMD-1089", type: "Mauvais produit reçu", status: "Fermé" },
]

export default function SupportAndClaimsPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const initialTab = searchParams.get("tab") || "support"

  // État pour le formulaire de support
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState(initialTab)

  // État pour le formulaire de réclamation
  const [claim, setClaim] = useState<Claim>({
    orderId: orderId || "",
    claimType: "",
    description: "",
    attachments: [],
  })
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orderId) {
      // Simuler un appel API pour obtenir les détails de la commande
      setOrder({
        id: orderId,
        number: `CMD-${orderId}`,
      })

      // Si un orderId est présent, activer l'onglet réclamations
      setActiveTab("reclamations")
    }
  }, [orderId])

  // Gestionnaires pour le formulaire de support
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ subject, message })
    toast({
      title: "Demande envoyée",
      description: "Votre demande de support a été envoyée avec succès.",
    })
    setSubject("")
    setMessage("")
  }

  // Gestionnaires pour le formulaire de réclamation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClaim((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setClaim((prev) => ({ ...prev, claimType: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setClaim((prev) => ({ ...prev, attachments: Array.from(e.target.files || []) }))
    }
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Réclamation soumise:", claim)
    toast({
      title: "Réclamation envoyée",
      description: "Nous avons bien reçu votre réclamation et nous la traiterons dans les plus brefs délais.",
    })
    setClaim({
      orderId: "",
      claimType: "",
      description: "",
      attachments: [],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support & Réclamations</h1>
        <p className="text-muted-foreground">
          Contactez notre équipe d'assistance ou soumettez une réclamation concernant vos commandes
        </p>
      </div>

      {/* Onglet Support */}
      <div className="mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Formulaire de contact</h2>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Sujet du problème
                </label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Problème de paiement</SelectItem>
                    <SelectItem value="delivery">Problème de livraison</SelectItem>
                    <SelectItem value="account">Problème de compte</SelectItem>
                    <SelectItem value="damaged">Produit endommagé</SelectItem>
                    <SelectItem value="missing">Produit manquant</SelectItem>
                    <SelectItem value="wrong">Mauvais produit reçu</SelectItem>
                    <SelectItem value="other">Autre problème</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Description détaillée
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Pièces jointes</Label>
                <Input id="attachments" name="attachments" type="file" onChange={handleFileChange} multiple />
                <p className="text-sm text-muted-foreground">
                  Vous pouvez joindre des photos ou des documents pertinents (max 5 fichiers, 10 MB chacun)
                </p>
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Envoyer la demande
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Informations de contact direct</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>support@logitech.com</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-4">Historique des tickets</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.date}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.status === "Ouvert"
                            ? "default"
                            : ticket.status === "En cours"
                              ? "secondary"
                              : "success"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/dashboard/client/support/${ticket.id}`}>Détails</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Conseils pour les réclamations</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Soumettez votre réclamation dans les 14 jours suivant la réception de votre commande</li>
                    <li>Joignez des photos claires montrant les dommages ou problèmes</li>
                    <li>Conservez l'emballage d'origine jusqu'à la résolution de votre réclamation</li>
                    <li>Fournissez une description détaillée du problème pour accélérer le traitement</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
