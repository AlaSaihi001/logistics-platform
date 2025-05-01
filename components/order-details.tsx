"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";

interface OrderDetailsProps {
  order: any;
  onChange: (details: any) => void;
}

export function OrderDetails({ order, onChange }: OrderDetailsProps) {
  // Initialize state with proper checks to avoid accessing undefined properties
  const [details, setDetails] = useState({
    nom: order?.nom || "",
    pays: order?.pays || "",
    adresse: order?.adresse || "",
    valeurMarchandise: order?.valeurMarchandise || 0,
    typeCommande: order?.typeCommande || "",
    typeTransport: order?.typeTransport || "",
    ecoterme: order?.ecoterme || "",
    modePaiement: order?.modePaiement || "",
    dateDePickup: order?.dateDePickup
      ? new Date(order.dateDePickup)
      : new Date(),
  });

  useEffect(() => {
    if (order) {
      setDetails({
        nom: order?.nom || "",
        pays: order?.pays || "",
        adresse: order?.adresse || "",
        valeurMarchandise: order?.valeurMarchandise || 0,
        typeCommande: order?.typeCommande || "",
        typeTransport: order?.typeTransport || "",
        ecoterme: order?.ecoterme || "",
        modePaiement: order?.modePaiement || "",
        dateDePickup: order?.dateDePickup
          ? new Date(order.dateDePickup)
          : new Date(),
      });
    }
  }, [order]);

  const handleChange = (key: string, value: any) => {
    const updated = { ...details, [key]: value };
    setDetails(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Détails Commande</h2>

      <div className="space-y-2">
        <Label htmlFor="orderName">Nom commande</Label>
        <Input
          id="orderName"
          value={details.nom}
          onChange={(e) => handleChange("nom", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Pays</Label>
        <Input
          id="country"
          value={details.pays}
          onChange={(e) => handleChange("pays", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderAddress">Adresse de commande</Label>
        <Input
          id="orderAddress"
          value={details.adresse}
          onChange={(e) => handleChange("adresse", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Date de pickup</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{details.dateDePickup.toLocaleDateString()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={details.dateDePickup}
              onSelect={(date) =>
                handleChange("dateDePickup", date || new Date())
              }
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="merchandiseValue">Valeur de marchandise (€)</Label>
        <Input
          id="merchandiseValue"
          type="number"
          value={details.valeurMarchandise}
          onChange={(e) =>
            handleChange("valeurMarchandise", Number(e.target.value))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Type de commande</Label>
        <RadioGroup
          defaultValue={details.typeCommande}
          onValueChange={(value) => handleChange("typeCommande", value)}
        >
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
        <RadioGroup
          defaultValue={details.typeTransport}
          onValueChange={(value) => handleChange("typeTransport", value)}
        >
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
        <Select
          value={details.ecoterme}
          onValueChange={(value) => handleChange("ecoterme", value)}
        >
          <SelectTrigger id="ecoterms">
            <SelectValue placeholder="Sélectionner un incoterm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FOB">FOB</SelectItem>
            <SelectItem value="CIF">CIF</SelectItem>
            <SelectItem value="EXW">EXW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMode">Mode de paiement préféré</Label>
        <Select
          value={details.modePaiement}
          onValueChange={(value) => handleChange("modePaiement", value)}
        >
          <SelectTrigger id="paymentMode">
            <SelectValue placeholder="Sélectionner un mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
            <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
