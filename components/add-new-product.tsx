"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Product {
  id?: string
  image: File | string | null
  name: string
  category: string
  unitPrice: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  quantity: number
  description: string
  isFragile: boolean
  packagingType: string
  documents?: File[] // Add this line
}

interface AddNewProductProps {
  open: boolean
  onClose: () => void
  onAdd: (product: Product) => void
  initialData?: Product | null
}

export function AddNewProduct({ open, onClose, onAdd, initialData }: AddNewProductProps) {
  const [product, setProduct] = useState<Product>({
    image: null,
    name: "",
    category: "",
    unitPrice: 0,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    quantity: 0,
    description: "",
    isFragile: false,
    packagingType: "",
    documents: [], // Add this line
  })

  useEffect(() => {
    if (initialData) {
      setProduct(initialData)
    }
  }, [initialData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProduct((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setProduct((prev) => ({ ...prev, documents: filesArray }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("dimensions.")) {
      const dimension = name.split(".")[1]
      setProduct((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: Number(value) },
      }))
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: name === "unitPrice" || name === "weight" || name === "quantity" ? Number(value) : value,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(product)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier le produit" : "Ajouter un nouveau produit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Documents (Factures, certificats, etc.)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleDocumentsChange}
                className="cursor-pointer"
              />
              {product.documents && product.documents.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {product.documents.length} document(s) sélectionné(s)
                </div>
              )}
              <p className="text-red-700">Essayez de mettre tous les document en 1 seul fichier PDF.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" name="name" value={product.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={product.category}
                onValueChange={(value) => setProduct((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Électronique</SelectItem>
                  <SelectItem value="clothing">Vêtements</SelectItem>
                  <SelectItem value="furniture">Meubles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Tarif unitaire (€)</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                step="0.01"
                value={product.unitPrice}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Poids (Kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                value={product.weight}
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
                  name="dimensions.length"
                  type="number"
                  placeholder="Longueur"
                  value={product.dimensions.length}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="dimensions.width"
                  type="number"
                  placeholder="Largeur"
                  value={product.dimensions.width}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="dimensions.height"
                  type="number"
                  placeholder="Hauteur"
                  value={product.dimensions.height}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={product.quantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type de conditionnement</Label>
              <Select
                value={product.packagingType}
                onValueChange={(value) => setProduct((prev) => ({ ...prev, packagingType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="palette">Palette</SelectItem>
                  <SelectItem value="caisse">Caisse</SelectItem>
                  <SelectItem value="vrac">Vrac</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Produit fragile ?</Label>
              <RadioGroup
                defaultValue={product.isFragile ? "yes" : "no"}
                onValueChange={(value) => setProduct((prev) => ({ ...prev, isFragile: value === "yes" }))}
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
              <Label htmlFor="description">Description détaillée</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>

          <div className="col-span-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{initialData ? "Modifier" : "Ajouter"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
