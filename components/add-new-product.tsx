"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Product } from "@/types/product";

interface AddNewProductProps {
  open: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
  initialData?: Product | null;
}

export function AddNewProduct({
  open,
  onClose,
  onAdd,
  initialData,
}: AddNewProductProps) {
  const [product, setProduct] = useState<Product>({
    nom: "",
    categorie: "",
    tarifUnitaire: 0,
    poids: 0,
    largeur: 0,
    longueur: 0,
    hauteur: 0,
    quantite: 0,
    typeConditionnement: "",
    fragile: false,
    description: "",
    image: undefined,
    document: undefined,
  });

  useEffect(() => {
    if (initialData) {
      setProduct(initialData);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: [
        "tarifUnitaire",
        "poids",
        "largeur",
        "longueur",
        "hauteur",
        "quantite",
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProduct((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(product);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier le produit" : "Ajouter un nouveau produit"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom du produit</Label>
              <Input
                id="nom"
                name="nom"
                value={product.nom}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              <Input
                id="categorie"
                name="categorie"
                value={product.categorie || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifUnitaire">Tarif unitaire (€)</Label>
              <Input
                id="tarifUnitaire"
                name="tarifUnitaire"
                type="number"
                step="0.01"
                value={product.tarifUnitaire}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poids">Poids (Kg)</Label>
              <Input
                id="poids"
                name="poids"
                type="number"
                step="0.01"
                value={product.poids}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  name="longueur"
                  type="number"
                  placeholder="Longueur"
                  value={product.longueur}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="largeur"
                  type="number"
                  placeholder="Largeur"
                  value={product.largeur}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="hauteur"
                  type="number"
                  placeholder="Hauteur"
                  value={product.hauteur}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                name="quantite"
                type="number"
                value={product.quantite}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type de conditionnement</Label>
              <Input
                id="typeConditionnement"
                name="typeConditionnement"
                value={product.typeConditionnement}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Produit fragile ?</Label>
              <RadioGroup
                defaultValue={product.fragile ? "yes" : "no"}
                onValueChange={(value) =>
                  setProduct((prev) => ({ ...prev, fragile: value === "yes" }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="fragile-yes" />
                  <Label htmlFor="fragile-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="fragile-no" />
                  <Label htmlFor="fragile-no">Non</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description || ""}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>

          <div className="col-span-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {initialData ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
