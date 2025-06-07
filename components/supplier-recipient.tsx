"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface SupplierRecipientProps {
  recipient?: {
    nomDestinataire: string;
    paysDestinataire: string;
    adresseDestinataire: string;
    indicatifTelephoneDestinataire: string;
    telephoneDestinataire: number;
    emailDestinataire: string;
  };
  onChange: (details: any) => void;
}

export function SupplierRecipient({
  recipient,
  onChange,
}: SupplierRecipientProps) {
  const [details, setDetails] = useState({
    nomDestinataire: "",
    paysDestinataire: "",
    adresseDestinataire: "",
    indicatifTelephoneDestinataire: "",
    telephoneDestinataire: "",
    emailDestinataire: "",
  });

  useEffect(() => {
    if (recipient) {
      setDetails({
        nomDestinataire: recipient?.nomDestinataire || "",
        paysDestinataire: recipient?.paysDestinataire || "",
        adresseDestinataire: recipient?.adresseDestinataire || "",
        indicatifTelephoneDestinataire:
          recipient?.indicatifTelephoneDestinataire || "",
        telephoneDestinataire:
          recipient?.telephoneDestinataire?.toString() || "",
        emailDestinataire: recipient?.emailDestinataire || "",
      });
    }
  }, [recipient]);

  const handleChange = (key: string, value: string) => {
    const updated = { ...details, [key]: value };
    setDetails(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Destinataire */}
      <div className="space-y-8">
        <h2 className="text-lg font-semibold">Destinataire</h2>

        <div className="space-y-2">
          <Label htmlFor="nomDestinataire">Nom destinataire</Label>
          <Input
            id="nomDestinataire"
            value={details.nomDestinataire}
            onChange={(e) => handleChange("nomDestinataire", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paysDestinataire">Pays destinataire</Label>
          <Input
            id="paysDestinataire"
            value={details.paysDestinataire}
            onChange={(e) => handleChange("paysDestinataire", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresseDestinataire">Adresse destinataire</Label>
          <Input
            id="adresseDestinataire"
            value={details.adresseDestinataire}
            onChange={(e) =>
              handleChange("adresseDestinataire", e.target.value)
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone destinataire</Label>
          <div className="flex space-x-2">
            <Input
              id="indicatifTelephoneDestinataire"
              value={details.indicatifTelephoneDestinataire}
              onChange={(e) =>
                handleChange("indicatifTelephoneDestinataire", e.target.value)
              }
              placeholder="+216"
              className="w-[100px]"
              required
            />
            <Input
              id="telephoneDestinataire"
              value={details.telephoneDestinataire}
              onChange={(e) =>
                handleChange("telephoneDestinataire", e.target.value)
              }
              placeholder="Numéro"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailDestinataire">Email destinataire</Label>
          <Input
            id="emailDestinataire"
            type="email"
            value={details.emailDestinataire}
            onChange={(e) => handleChange("emailDestinataire", e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
