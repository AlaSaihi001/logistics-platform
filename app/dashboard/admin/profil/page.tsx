"use client"

import type React from "react"

import { useState } from "react"
import { User, Mail, Phone, Lock, Save, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Données fictives pour le profil de l'administrateur
const adminProfile = {
  id: "ADM-001",
  nom: "Dupont",
  prenom: "Jean",
  email: "jean.dupont@logitech.com",
  telephone: "+33 6 12 34 56 78",
  poste: "Administrateur Système",
  dateEmbauche: "05/01/2018",
  bureau: "Paris",
  avatar: "/placeholder.svg",
  historique: [
    { date: "30/03/2023 16:30", action: "Ajout d'un nouvel utilisateur", details: "USR-2023-012" },
    { date: "30/03/2023 14:15", action: "Modification des paramètres système", details: "SYS-2023-045" },
    { date: "29/03/2023 11:45", action: "Validation du paiement", details: "PAY-2023-089" },
    { date: "28/03/2023 09:30", action: "Résolution de la réclamation", details: "REC-2023-034" },
    { date: "27/03/2023 15:20", action: "Mise à jour des tarifs logistiques", details: "LOG-2023-056" },
  ],
}

export default function ProfilPage() {
  const [profile, setProfile] = useState({
    nom: adminProfile.nom,
    prenom: adminProfile.prenom,
    email: adminProfile.email,
    telephone: adminProfile.telephone,
  })

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPassword((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici, vous implémenteriez la logique pour mettre à jour le profil
    console.log("Profil mis à jour:", profile)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici, vous implémenteriez la logique pour changer le mot de passe
    console.log("Mot de passe changé")
    setPassword({ current: "", new: "", confirm: "" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et vos paramètres</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-background">
              <AvatarImage src={adminProfile.avatar} alt={`${adminProfile.prenom} ${adminProfile.nom}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {adminProfile.prenom[0]}
                {adminProfile.nom[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">
              {adminProfile.prenom} {adminProfile.nom}
            </h3>
            <p className="text-muted-foreground">{adminProfile.poste}</p>
            <div className="mt-6 space-y-3 w-full text-left">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base break-all">{adminProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base">{adminProfile.telephone}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base">Bureau: {adminProfile.bureau}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base">Date d'embauche: {adminProfile.dateEmbauche}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:w-2/3">
          <Tabs defaultValue="informations" className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <TabsList>
                <TabsTrigger value="informations">Informations personnelles</TabsTrigger>
                <TabsTrigger value="securite">Sécurité</TabsTrigger>
                <TabsTrigger value="historique">Historique des actions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="informations">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prenom">Prénom</Label>
                          <Input id="prenom" name="prenom" value={profile.prenom} onChange={handleProfileChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom</Label>
                          <Input id="nom" name="nom" value={profile.nom} onChange={handleProfileChange} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                          id="telephone"
                          name="telephone"
                          value={profile.telephone}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="securite">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>Mettez à jour votre mot de passe</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current">Mot de passe actuel</Label>
                        <Input
                          id="current"
                          name="current"
                          type="password"
                          value={password.current}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">Nouveau mot de passe</Label>
                        <Input
                          id="new"
                          name="new"
                          type="password"
                          value={password.new}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
                        <Input
                          id="confirm"
                          name="confirm"
                          type="password"
                          value={password.confirm}
                          onChange={handlePasswordChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full sm:w-auto">
                      <Lock className="mr-2 h-4 w-4" />
                      Changer le mot de passe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historique">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des actions</CardTitle>
                  <CardDescription>Consultez l'historique de vos actions récentes</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell">Détails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminProfile.historique.map((action, index) => (
                        <TableRow key={index}>
                          <TableCell>{action.date}</TableCell>
                          <TableCell>{action.action}</TableCell>
                          <TableCell className="hidden md:table-cell">{action.details || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
