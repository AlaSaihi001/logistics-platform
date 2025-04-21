import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, CreditCard, Download, FileText, Package, Printer, Receipt, User } from "lucide-react"
import Link from "next/link"

export default function TransactionDetailsPage({ params }: { params: { id: string } }) {
  const transactionId = params.id

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/paiements">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Transaction #{transactionId}</h1>
              <Badge className="ml-2 bg-green-500">Réussie</Badge>
            </div>
            <p className="text-muted-foreground">Effectuée le 15/03/2023 à 14:35</p>
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
              <CardTitle>Détails de la transaction</CardTitle>
              <CardDescription>Informations sur cette transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID de transaction</p>
                  <p className="font-medium">{transactionId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    15/03/2023 à 14:35
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Méthode de paiement</p>
                  <p className="font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Carte bancaire (Visa se terminant par 4242)
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <Badge className="bg-green-500">Réussie</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Montant</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">1,250.00 €</p>
                  <Badge variant="outline">TVA incluse</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Référence</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Commande #ORD-2023-123</p>
                  <Button variant="link" className="h-auto p-0" asChild>
                    <Link href={`/dashboard/admin/commandes/${transactionId}`}>Voir la commande</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Sous-total</p>
                      <p className="font-medium">1,041.67 €</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">TVA (20%)</p>
                      <p className="font-medium">208.33 €</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Frais de livraison</p>
                      <p className="font-medium">0.00 €</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Remises</p>
                      <p className="font-medium">0.00 €</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total</p>
                    <p className="text-xl font-bold">1,250.00 €</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations de facturation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Adresse de facturation</p>
                    <p className="text-sm">Jean Dupont</p>
                    <p className="text-sm">Entreprise SAS</p>
                    <p className="text-sm">123 Rue de Paris</p>
                    <p className="text-sm">75001 Paris</p>
                    <p className="text-sm">France</p>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Informations fiscales</p>
                    <p className="text-sm">SIRET: 123 456 789 00012</p>
                    <p className="text-sm">Numéro de TVA: FR 12 345678901</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produits facturés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Produit A</p>
                            <p className="text-sm text-muted-foreground">2 x 500.00 €</p>
                          </div>
                        </div>
                        <p className="font-medium">1,000.00 €</p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Produit B</p>
                            <p className="text-sm text-muted-foreground">1 x 250.00 €</p>
                          </div>
                        </div>
                        <p className="font-medium">250.00 €</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Sous-total</p>
                    <p className="text-sm text-muted-foreground">TVA (20%)</p>
                    <p className="font-medium mt-2">Total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">1,041.67 €</p>
                    <p className="text-sm">208.33 €</p>
                    <p className="font-medium mt-2">1,250.00 €</p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique de la transaction</CardTitle>
                  <CardDescription>Suivi des événements liés à cette transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CreditCard className="h-4 w-4" />
                        <div className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Transaction initiée</p>
                        <p className="text-sm text-muted-foreground">15/03/2023 à 14:30</p>
                        <p className="text-sm">La transaction a été initiée par le client</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Autorisation bancaire</p>
                        <p className="text-sm text-muted-foreground">15/03/2023 à 14:32</p>
                        <p className="text-sm">La banque a autorisé la transaction</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Paiement confirmé</p>
                        <p className="text-sm text-muted-foreground">15/03/2023 à 14:35</p>
                        <p className="text-sm">Le paiement a été confirmé et traité</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Facture générée</p>
                        <p className="text-sm text-muted-foreground">15/03/2023 à 14:40</p>
                        <p className="text-sm">La facture a été générée et envoyée au client</p>
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
                          <AvatarFallback>SD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Sophie Dubois</p>
                            <p className="text-xs text-muted-foreground">15/03/2023 à 15:20</p>
                          </div>
                          <p className="text-sm">Transaction vérifiée, tout est en ordre.</p>
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
                <Printer className="h-4 w-4 mr-2" />
                Imprimer le reçu
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Générer une facture
              </Button>
              <Button className="w-full" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Envoyer un reçu par email
              </Button>
              <Button className="w-full" variant="destructive">
                Rembourser la transaction
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
              <CardTitle>Transactions liées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Transaction #TRX-2023-089</p>
                    <p className="text-xs text-muted-foreground">10/02/2023</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Réussie</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Transaction #TRX-2023-045</p>
                    <p className="text-xs text-muted-foreground">15/01/2023</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Réussie</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir toutes les transactions
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
