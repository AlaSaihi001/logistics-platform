"use client";

import { useState, useEffect } from "react";
import { Send, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Types pour la réclamation
interface Claim {
  claimType: string; // Type de réclamation
  description: string; // Description de la réclamation
  attachments: { name: string; url: string }[]; // Documents sous forme de tableau [nom, url]
}

export default function SupportAndClaimsPage() {
  const [claim, setClaim] = useState<Claim>({
    claimType: "",
    description: "",
    attachments: [],
  });

  const [claimsHistory, setClaimsHistory] = useState<any[]>([]);

  useEffect(() => {
    // Charger l'historique des réclamations
    const fetchClaimsHistory = async () => {
      try {
        const response = await fetch("/api/client/reclamations");
        if (response.ok) {
          const data = await response.json();
          setClaimsHistory(data);
        } else {
          throw new Error("Erreur lors du chargement des réclamations");
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des réclamations",
          variant: "destructive",
        });
      }
    };

    fetchClaimsHistory();
  }, []);

  // Mise à jour des valeurs du formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClaim((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setClaim((prev) => ({ ...prev, claimType: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const attachments = Array.from(e.target.files).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file), // Utilisation d'un objet URL pour prévisualiser le fichier
      }));
      setClaim((prev) => ({
        ...prev,
        attachments: attachments,
      }));
    }
  };

  // Fonction pour soumettre la réclamation
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    if (!claim.claimType || !claim.description) {
      toast({
        title: "Erreur",
        description:
          "Le type de réclamation et la description sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Préparer les données à envoyer à l'API
    const body = {
      claimType: claim.claimType,
      description: claim.description,
      attachments: claim.attachments,
    };

    try {
      const response = await fetch("/api/reclamations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Envoi des données sous forme de JSON
      });

      if (response.ok) {
        const newClaimEntry = await response.json();
        toast({
          title: "Réclamation envoyée",
          description:
            "Nous avons bien reçu votre réclamation et nous la traiterons dans les plus brefs délais.",
        });
        setClaimsHistory((prev) => [...prev, newClaimEntry]);
        // Réinitialiser les champs après soumission
        setClaim({
          claimType: "",
          description: "",
          attachments: [],
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de soumettre la réclamation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la réclamation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Support & Réclamations
        </h1>
        <p className="text-muted-foreground">
          Contactez notre équipe d'assistance ou soumettez une réclamation
          concernant vos commandes
        </p>
      </div>

      {/* Formulaire de réclamation */}
      <div className="mt-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Formulaire de réclamation
            </h2>
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="claimType"
                  className="block text-sm font-medium mb-1"
                >
                  Type de réclamation
                </label>
                <Select
                  value={claim.claimType}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type de réclamation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Problème de paiement">
                      Problème de paiement
                    </SelectItem>
                    <SelectItem value="Problème de livraison">
                      Problème de livraison
                    </SelectItem>
                    <SelectItem value="Problème de compte">
                      Problème de compte
                    </SelectItem>
                    <SelectItem value="Produit endommagé">
                      Produit endommagé
                    </SelectItem>
                    <SelectItem value="Produit manquant">
                      Produit manquant
                    </SelectItem>
                    <SelectItem value="Mauvais produit reçu">
                      Mauvais produit reçu
                    </SelectItem>
                    <SelectItem value="Autre problème">
                      Autre problème
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description détaillée
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={claim.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre réclamation"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Pièces jointes</Label>
                <Input
                  id="attachments"
                  name="attachments"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                />
                <p className="text-sm text-muted-foreground">
                  Vous pouvez joindre des photos ou des documents pertinents
                  (max 5 fichiers, 10 MB chacun)
                </p>
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Envoyer la réclamation
              </Button>
            </form>
          </div>

          <div>
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Informations de contact direct
              </h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>support@logitech.com</span>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">
                Conseils pour les réclamations
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      Joignez des photos claires montrant les dommages ou
                      problèmes
                    </li>
                    <li>
                      Conservez l'emballage d'origine jusqu'à la résolution de
                      votre réclamation
                    </li>
                    <li>
                      Fournissez une description détaillée du problème pour
                      accélérer le traitement
                    </li>
                    <li>
                      Mentionnez toujours votre numéro de commande pour
                      faciliter l’identification de votre réclamation
                    </li>
                    <li>
                      Si possible, indiquez la référence du produit ou des
                      numéros de série pour une meilleure gestion de votre
                      demande
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des réclamations */}
      <h2 className="text-xl font-semibold mt-6 mb-4">
        Historique des réclamations
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Sujet</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claimsHistory.map((claim) => (
            <TableRow key={claim.id}>
              <TableCell>{claim.id}</TableCell>
              <TableCell>{claim.sujet}</TableCell>
              <TableCell>{claim.date}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    claim.status === "En cours" ? "secondary" : "default" // Adjusted variant values
                  }
                >
                  {claim.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/client/support/${claim.id}`}>Détails</a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
