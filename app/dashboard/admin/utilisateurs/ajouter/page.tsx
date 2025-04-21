import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, UserPlus, Phone } from "lucide-react"
import Link from "next/link"

export default function AddUserPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/utilisateurs">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ajouter un utilisateur</h1>
            <p className="text-muted-foreground">Créez un nouveau compte utilisateur</p>
          </div>
        </div>
        <Button className="shrink-0">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Détails du compte</TabsTrigger>
          <TabsTrigger value="permissions">Rôles et permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Entrez les informations personnelles de l'utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Prénom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Nom" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="+212 6XX XXX XXX" className="pl-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>Configurez les détails du compte utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input id="username" placeholder="nom.utilisateur" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">Type d'utilisateur</Label>
                <Select>
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Sélectionnez un type d'utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="sendCredentials" />
                <Label htmlFor="sendCredentials">Envoyer les identifiants par email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="requirePasswordChange" />
                <Label htmlFor="requirePasswordChange">
                  Exiger un changement de mot de passe à la première connexion
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations professionnelles</CardTitle>
              <CardDescription>Entrez les informations professionnelles de l'utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input id="company" placeholder="Nom de l'entreprise" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input id="department" placeholder="Département" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Input id="position" placeholder="Poste" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Adresse" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rôle utilisateur</CardTitle>
              <CardDescription>Définissez le rôle principal de l'utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client standard</SelectItem>
                    <SelectItem value="client-premium">Client premium</SelectItem>
                    <SelectItem value="agent-junior">Agent junior</SelectItem>
                    <SelectItem value="agent-senior">Agent senior</SelectItem>
                    <SelectItem value="assistant-junior">Assistant junior</SelectItem>
                    <SelectItem value="assistant-senior">Assistant senior</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="super-admin">Super administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Définissez les permissions spécifiques pour cet utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Commandes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-orders-view" />
                    <Label htmlFor="perm-orders-view">Voir les commandes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-orders-create" />
                    <Label htmlFor="perm-orders-create">Créer des commandes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-orders-edit" />
                    <Label htmlFor="perm-orders-edit">Modifier les commandes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-orders-delete" />
                    <Label htmlFor="perm-orders-delete">Supprimer des commandes</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Factures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-invoices-view" />
                    <Label htmlFor="perm-invoices-view">Voir les factures</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-invoices-create" />
                    <Label htmlFor="perm-invoices-create">Créer des factures</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-invoices-edit" />
                    <Label htmlFor="perm-invoices-edit">Modifier les factures</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-invoices-delete" />
                    <Label htmlFor="perm-invoices-delete">Supprimer des factures</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Utilisateurs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-users-view" />
                    <Label htmlFor="perm-users-view">Voir les utilisateurs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-users-create" />
                    <Label htmlFor="perm-users-create">Créer des utilisateurs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-users-edit" />
                    <Label htmlFor="perm-users-edit">Modifier les utilisateurs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-users-delete" />
                    <Label htmlFor="perm-users-delete">Supprimer des utilisateurs</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Rapports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-reports-view" />
                    <Label htmlFor="perm-reports-view">Voir les rapports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-reports-create" />
                    <Label htmlFor="perm-reports-create">Créer des rapports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-reports-export" />
                    <Label htmlFor="perm-reports-export">Exporter des rapports</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter l'utilisateur
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
