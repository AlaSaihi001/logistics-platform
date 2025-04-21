"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SupplierRecipient({ onChange }: { onChange: (details: any) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fournisseur / Destinataire</h2>

      <div className="space-y-2">
        <Label htmlFor="supplierName">Nom du fournisseur / destinataire</Label>
        <Input id="supplierName" placeholder="Nom complet" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Pays d'expédition & destination</Label>
        <Select onValueChange={(value) => onChange({ country: value })}>
          <SelectTrigger id="country">
            <SelectValue placeholder="Sélectionner un pays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="us">États-Unis</SelectItem>
            {/* Add more countries as needed */}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse complète</Label>
        <Input id="address" placeholder="Adresse physique" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
        <div className="flex space-x-2">
          <Select onValueChange={(value) => onChange({ phoneCountry: value })}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">FR +33</SelectItem>
              <SelectItem value="us">US +1</SelectItem>
              {/* Add more country codes as needed */}
            </SelectContent>
          </Select>
          <Input id="phoneNumber" type="tel" placeholder="Numéro de téléphone" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="adresse@email.com" required />
      </div>
    </div>
  )
}
