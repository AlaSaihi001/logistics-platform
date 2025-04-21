"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Product {
  id?: string
  image: string
  name: string
  category: string
  unitPrice: number
  weight: number
  dimensions: { length: number; width: number; height: number }
  quantity: number
}

interface ProductFormProps {
  onSubmit: (product: Product) => void
  initialData?: Product | null
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [product, setProduct] = useState<Product>(
    initialData || {
      image: "",
      name: "",
      category: "",
      unitPrice: 0,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      quantity: 0,
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith("dimensions.")) {
      const dimensionKey = name.split(".")[1] as "length" | "width" | "height"
      setProduct({
        ...product,
        dimensions: { ...product.dimensions, [dimensionKey]: Number.parseFloat(value) || 0 },
      })
    } else {
      setProduct({
        ...product,
        [name]:
          name === "unitPrice" || name === "weight" || name === "quantity" ? Number.parseFloat(value) || 0 : value,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(product)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input id="image" name="image" value={product.image} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit</Label>
        <Input id="name" name="name" value={product.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Input id="category" name="category" value={product.category} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="unitPrice">Tarif unitaire (€)</Label>
        <Input
          id="unitPrice"
          name="unitPrice"
          type="number"
          step="0.01"
          value={product.unitPrice}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight">Poids (Kg)</Label>
        <Input
          id="weight"
          name="weight"
          type="number"
          step="0.1"
          value={product.weight}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Dimensions (cm)</Label>
        <div className="flex space-x-2">
          <Input
            name="dimensions.length"
            type="number"
            placeholder="Longueur"
            value={product.dimensions.length}
            onChange={handleChange}
            required
          />
          <Input
            name="dimensions.width"
            type="number"
            placeholder="Largeur"
            value={product.dimensions.width}
            onChange={handleChange}
            required
          />
          <Input
            name="dimensions.height"
            type="number"
            placeholder="Hauteur"
            value={product.dimensions.height}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité</Label>
        <Input id="quantity" name="quantity" type="number" value={product.quantity} onChange={handleChange} required />
      </div>
      <Button type="submit">{initialData ? "Modifier" : "Ajouter"}</Button>
    </form>
  )
}
