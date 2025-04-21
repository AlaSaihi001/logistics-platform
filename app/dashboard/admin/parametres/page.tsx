"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Building2, Camera, Globe, Lock, LogOut, Mail, Monitor, Moon, Settings, Shield, Sun } from "lucide-react"
import { DashboardHeader, DashboardShell } from "@/components/ui/dashboard-shell"

export default function AdminSettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Paramètres" description="Gérez les paramètres de la plateforme et votre profil">
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Sauvegarder les modifications
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil Administrateur</CardTitle>
            <CardDescription>Gérez votre profil et vos préférences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom d'utilisateur</Label>
                <div className="font-medium">Admin User</div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="font-medium">admin@example.com</div>
              </div>

              <div className="space-y-2">
                <Label>Rôle</Label>
                <div className="font-medium">Administrateur Système</div>
              </div>

              <Button variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="system">
                <Building2 className="h-4 w-4 mr-2" />
                Système
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Monitor className="h-4 w-4 mr-2" />
                Apparence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité du Compte</CardTitle>
                  <CardDescription>Gérez la sécurité de votre compte administrateur</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
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
                    <Button className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Mettre à jour le mot de passe
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Authentification 2FA</div>
                        <div className="text-sm text-muted-foreground">
                          Sécurité renforcée par authentification à deux facteurs
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Notifications de connexion</div>
                        <div className="text-sm text-muted-foreground">
                          Recevoir une alerte lors des nouvelles connexions
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de Notification</CardTitle>
                  <CardDescription>Gérez vos notifications système</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Nouvelles commandes</div>
                      <div className="text-sm text-muted-foreground">Notifications pour les nouvelles commandes</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Réclamations</div>
                      <div className="text-sm text-muted-foreground">Alertes pour les nouvelles réclamations</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Rapports système</div>
                      <div className="text-sm text-muted-foreground">Rapports quotidiens et hebdomadaires</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Alertes de sécurité</div>
                      <div className="text-sm text-muted-foreground">Notifications de sécurité importantes</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Système</CardTitle>
                  <CardDescription>Paramètres généraux de la plateforme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>URL du système</Label>
                      <div className="flex gap-2">
                        <Input placeholder="https://logistique.example.com" />
                        <Button variant="outline" size="icon">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email support</Label>
                      <div className="flex gap-2">
                        <Input placeholder="support@example.com" />
                        <Button variant="outline" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Langue système</Label>
                      <Select defaultValue="fr">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Fuseau horaire</Label>
                      <Select defaultValue="europe-paris">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le fuseau horaire" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="europe-paris">Europe/Paris (GMT+1)</SelectItem>
                          <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                          <SelectItem value="america-new_york">America/New_York (GMT-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>Personnalisez l'interface utilisateur</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Thème système</div>
                        <div className="text-sm text-muted-foreground">Utiliser le thème de votre système</div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Sélectionner le thème</Label>
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

                    <Separator />

                    <div className="space-y-2">
                      <Label>Densité d'affichage</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la densité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="comfortable">Confortable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  )
}
