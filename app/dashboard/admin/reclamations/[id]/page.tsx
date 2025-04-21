import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Download, FileText, MessageSquare, Package, Printer, User } from "lucide-react"
import Link from "next/link"

export default function ClaimDetailsPage({ params }: { params: { id: string } }) {
  const claimId = params.id

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/reclamations">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Réclamation #{claimId}</h1>
              <Badge variant="outline" className="ml-2 bg-yellow-500 text-white">
                En cours
              </Badge>
            </div>
            <p className="text-muted-foreground">Créée le 18/03/2023 à 10:15</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Statut de la réclamation</CardTitle>
              <CardDescription>Gérez le statut actuel de la réclamation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="status">Statut actuel</Label>
                  <Select defaultValue="processing">
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouvelle</SelectItem>
                      <SelectItem value="processing">En cours de traitement</SelectItem>
                      <SelectItem value="waiting">En attente de réponse</SelectItem>
                      <SelectItem value="resolved">Résolue</SelectItem>
                      <SelectItem value="closed">Clôturée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor="assignedTo">Assignée à</Label>
                  <Select defaultValue="assistant1">
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Sélectionnez un assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistant1">Marie Dubois</SelectItem>
                      <SelectItem value="assistant2">Thomas Bernard</SelectItem>
                      <SelectItem value="assistant3">Julie Lambert</SelectItem>
                      <SelectItem value="assistant4">Lucas Martin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Sélectionnez une priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Mettre à jour le statut</Button>
            </CardFooter>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de la réclamation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Numéro de réclamation</p>
                      <p className="font-medium">{claimId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        18/03/2023 à 10:15
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Type de réclamation</p>
                      <p className="font-medium">Produit endommagé</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Commande associée</p>
                      <p className="font-medium">
                        <Link href="/dashboard/admin/commandes/ORD-2023-123" className="text-primary hover:underline">
                          #ORD-2023-123
                        </Link>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Sujet</p>
                    <p className="font-medium">Produit A reçu endommagé</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <div className="rounded-md border p-4 bg-muted/50">
                      <p className="text-sm">
                        J'ai reçu le Produit A dans un état endommagé. L'emballage était intact, mais le produit
                        présente des fissures sur le côté droit. Je souhaiterais un remplacement ou un remboursement.
                        J'ai joint des photos du produit endommagé.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pièces jointes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <img
                          src="/placeholder.svg?height=200&width=300"
                          alt="Photo du produit endommagé"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-2 flex justify-between items-center">
                        <p className="text-sm truncate">photo-1.jpg</p>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <img
                          src="/placeholder.svg?height=200&width=300"
                          alt="Photo du produit endommagé"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-2 flex justify-between items-center">
                        <p className="text-sm truncate">photo-2.jpg</p>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="p-2 flex justify-between items-center">
                        <p className="text-sm truncate">facture.pdf</p>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation</CardTitle>
                  <CardDescription>Historique des messages échangés</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Jean Dupont (Client)</div>
                          <div className="text-xs text-muted-foreground">18/03/2023 à 10:15</div>
                        </div>
                        <div className="rounded-md border p-3 bg-muted/50">
                          <p className="text-sm">
                            J'ai reçu le Produit A dans un état endommagé. L'emballage était intact, mais le produit
                            présente des fissures sur le côté droit. Je souhaiterais un remplacement ou un
                            remboursement. J'ai joint des photos du produit endommagé.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                        <AvatarFallback>MD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Marie Dubois (Assistant)</div>
                          <div className="text-xs text-muted-foreground">18/03/2023 à 11:30</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-sm">
                            Bonjour M. Dupont, je vous remercie pour votre message et les photos jointes. Je suis
                            désolée pour ce désagrément. Nous allons examiner votre demande et vous proposer une
                            solution rapidement. Pourriez-vous me confirmer si l'emballage extérieur présentait des
                            signes de dommages ?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Jean Dupont (Client)</div>
                          <div className="text-xs text-muted-foreground">18/03/2023 à 14:05</div>
                        </div>
                        <div className="rounded-md border p-3 bg-muted/50">
                          <p className="text-sm">
                            Bonjour Mme Dubois, merci pour votre réponse rapide. Non, l'emballage extérieur était en
                            parfait état, aucun signe de dommage visible. C'est pourquoi j'ai été surpris de découvrir
                            le produit endommagé à l'intérieur.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="newMessage">Répondre</Label>
                    <Textarea id="newMessage" placeholder="Saisissez votre message ici..." rows={4} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Joindre un fichier</Button>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique de la réclamation</CardTitle>
                  <CardDescription>Suivi des modifications et des événements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <FileText className="h-4 w-4" />
                        <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Réclamation créée</p>
                        <p className="text-sm text-muted-foreground">18/03/2023 à 10:15</p>
                        <p className="text-sm">La réclamation a été créée par le client</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Réclamation assignée</p>
                        <p className="text-sm text-muted-foreground">18/03/2023 à 10:45</p>
                        <p className="text-sm">La réclamation a été assignée à Marie Dubois</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Message envoyé</p>
                        <p className="text-sm text-muted-foreground">18/03/2023 à 11:30</p>
                        <p className="text-sm">Marie Dubois a envoyé un message au client</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Réponse du client</p>
                        <p className="text-sm text-muted-foreground">18/03/2023 à 14:05</p>
                        <p className="text-sm">Le client a répondu au message</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes internes</CardTitle>
                  <CardDescription>Notes visibles uniquement par l'équipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                          <AvatarFallback>MD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Marie Dubois</p>
                            <p className="text-xs text-muted-foreground">18/03/2023 à 11:35</p>
                          </div>
                          <p className="text-sm">
                            J'ai vérifié les photos, le produit est clairement endommagé. Il s'agit probablement d'un
                            défaut de fabrication car l'emballage est intact. Je recommande un remplacement immédiat du
                            produit.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                          <AvatarFallback>TB</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Thomas Bernard</p>
                            <p className="text-xs text-muted-foreground">18/03/2023 à 15:20</p>
                          </div>
                          <p className="text-sm">
                            J'ai vérifié notre stock, nous avons des unités de remplacement disponibles. Nous pouvons
                            organiser un échange standard dès demain.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="newNote">Ajouter une note</Label>
                    <Textarea id="newNote" placeholder="Saisissez votre note ici..." />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Ajouter la note</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer un message
              </Button>
              <Button className="w-full" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer le rapport
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
              <Button className="w-full" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Créer un retour
              </Button>
              <Button className="w-full" variant="default">
                Marquer comme résolue
              </Button>
              <Button className="w-full" variant="destructive">
                Clôturer la réclamation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Jean Dupont</p>
                  <p className="text-sm text-muted-foreground">Client depuis 2021</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">Entreprise SAS</p>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">SIRET: 123 456 789 00012</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir le profil client
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réclamations liées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Réclamation #REC-2023-089</p>
                    <p className="text-xs text-muted-foreground">10/02/2023</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Résolue</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir toutes les réclamations
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
