"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fr } from "date-fns/locale"
import { useState } from "react"

interface OrderDetails {
  orderType?: string
  transportType?: string
  ecoterms?: string
  pickupDate?: Date
  paymentMode?: string
}

export function OrderDetails({ onChange }: { onChange: (details: any) => void }) {
  const [details, setDetails] = useState<OrderDetails>({
    orderType: "",
    transportType: "",
    ecoterms: "",
    pickupDate: new Date(),
    paymentMode: "",
  })

  const handleChange = (key: string, value: string) => {
    setDetails({ ...details, [key]: value })
    onChange({ ...details, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Détails Commande</h2>

      <div className="space-y-2">
        <Label htmlFor="orderName">Nom commande</Label>
        <Input id="orderName" placeholder="Nom de la commande" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Pays</Label>
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
        <Label htmlFor="orderAddress">Adresse de commande</Label>
        <Input id="orderAddress" placeholder="Adresse complète" required />
      </div>

      <div className="space-y-2">
        <Label>Date de pickup</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{details.pickupDate ? details.pickupDate.toLocaleDateString() : "Sélectionner une date"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={details.pickupDate}
              onSelect={(date) => {
                handleChange("pickupDate", date?.toISOString() || "")
                setDetails({ ...details, pickupDate: date })
                onChange({ ...details, pickupDate: date })
              }}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="merchandiseValue">Valeur de marchandise (€)</Label>
        <Input id="merchandiseValue" type="number" placeholder="0.00" required />
      </div>

      <div className="space-y-2">
        <Label>Type de commande</Label>
        <RadioGroup defaultValue="import" onValueChange={(value) => handleChange("orderType", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="import" id="import" />
            <Label htmlFor="import">Import</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="export" id="export" />
            <Label htmlFor="export">Export</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Type de transport</Label>
        <RadioGroup defaultValue="maritime" onValueChange={(value) => handleChange("transportType", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="maritime" id="maritime" />
            <Label htmlFor="maritime">Maritime</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aerien" id="aerien" />
            <Label htmlFor="aerien">Aérien</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="routier" id="routier" />
            <Label htmlFor="routier">Routier</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ecoterms">Ecotermes</Label>
        <Select value={details.ecoterms || ""} onValueChange={(value) => handleChange("ecoterms", value)}>
          <SelectTrigger id="ecoterms">
            <SelectValue placeholder="Sélectionner un incoterm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fob">FOB</SelectItem>
            <SelectItem value="cif">CIF</SelectItem>
            <SelectItem value="exw">EXW</SelectItem>
            {/* Add more incoterms as needed */}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMode">Mode de paiement préféré</Label>
        <Select value={details.paymentMode || ""} onValueChange={(value) => handleChange("paymentMode", value)}>
          <SelectTrigger id="paymentMode">
            <SelectValue placeholder="Sélectionner un mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Carte bancaire</SelectItem>
            <SelectItem value="transfer">Virement bancaire</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            {/* Add more payment modes as needed */}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
