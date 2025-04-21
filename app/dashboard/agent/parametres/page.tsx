import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, Monitor, Moon, Shield, Sun, User } from "lucide-react"

export default function AgentSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences et paramètres du compte</p>
        </div>
        <Button className="shrink-0">Sauvegarder les modifications</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Compte
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Monitor className="h-4 w-4 mr-2" />
              Apparence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>Mettez à jour les informations de votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" placeholder="Pierre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" placeholder="Martin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="pierre.martin@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Identifiant employé</Label>
                  <Input id="employeeId" placeholder="AG-12345" readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Input id="role" placeholder="Agent logistique" readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences de langue</CardTitle>
                <CardDescription>Choisissez votre langue préférée</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select defaultValue="europe-paris">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-paris">Europe/Paris (GMT+1)</SelectItem>
                      <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="america-new_york">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="asia-tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input id="newPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Mettre à jour le mot de passe</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions actives</CardTitle>
                <CardDescription>Gérez vos sessions actives sur différents appareils</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Chrome sur Windows</div>
                      <div className="text-sm text-muted-foreground">Paris, France · Actif maintenant</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Déconnecter
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Safari sur iPhone</div>
                      <div className="text-sm text-muted-foreground">
                        Paris, France · Dernière activité il y a 2 heures
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Déconnecter
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="text-destructive">
                  Déconnecter toutes les autres sessions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notifications par email</div>
                    <div className="text-sm text-muted-foreground">Recevez des notifications par email</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notifications par SMS</div>
                    <div className="text-sm text-muted-foreground">Recevez des notifications par SMS</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notifications dans l'application</div>
                    <div className="text-sm text-muted-foreground">Recevez des notifications dans l'application</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Types de notifications</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Nouvelles expéditions</div>
                      <div className="text-sm text-muted-foreground">Notifications pour les nouvelles expéditions</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Mises à jour des expéditions</div>
                      <div className="text-sm text-muted-foreground">
                        Notifications pour les mises à jour des expéditions
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Nouveaux documents</div>
                      <div className="text-sm text-muted-foreground">Notifications pour les nouveaux documents</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div>Rappels</div>
                      <div className="text-sm text-muted-foreground">Notifications pour les rappels</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Thème</CardTitle>
                <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Thème du système</div>
                      <div className="text-sm text-muted-foreground">Suivre les préférences du système</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Sélectionner un thème</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Sun className="h-4 w-4 mr-2" />
                        Clair
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Moon className="h-4 w-4 mr-2" />
                        Sombre
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Monitor className="h-4 w-4 mr-2" />
                        Système
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disposition</CardTitle>
                <CardDescription>Personnalisez la disposition de l'interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="density">Densité d'affichage</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger id="density">
                      <SelectValue placeholder="Sélectionnez une densité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="comfortable">Confortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Taille de police</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Sélectionnez une taille de police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
