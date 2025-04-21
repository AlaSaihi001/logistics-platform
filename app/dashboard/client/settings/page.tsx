"use client"

import type React from "react"

import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+33 6 12 34 56 78",
    address: "123 Rue de la Paix, 75001 Paris, France",
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    preferredPaymentMethod: "card",
    twoFactorAuth: false,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({ ...security, [e.target.name]: e.target.value })
  }

  const handlePreferencesChange = (key: string, value: boolean | string) => {
    setPreferences({ ...preferences, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profil</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" name="firstName" value={profile.firstName} onChange={handleProfileChange} />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" value={profile.lastName} onChange={handleProfileChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Sécurité</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={security.currentPassword}
                onChange={handleSecurityChange}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={security.newPassword}
                onChange={handleSecurityChange}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
              />
            </div>
            <Button>Mettre à jour le mot de passe</Button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Préférences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Notifications par email</Label>
              <Switch
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => handlePreferencesChange("emailNotifications", checked)}
              />
            </div>
          </div>
        </div>

        <Button className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  )
}
