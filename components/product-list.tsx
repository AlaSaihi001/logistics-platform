"use client"

import type React from "react"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddNewProduct } from "@/components/add-new-product"

interface Product {
  id: string
  image: string | File
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
}

interface ProductListProps {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

export function ProductList({ products, setProducts }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleDeleteProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId))
  }

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) => prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
    setEditingProduct(null)
  }

  const getImageSrc = (image: string | File) => {
    if (typeof image === "string") {
      return image
    }
    // If it's a File object, we can't create an object URL here
    // Instead, return a placeholder or leave it to the parent component to handle
    return "/placeholder.svg"
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Nom du produit</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Tarif unitaire (€)</TableHead>
            <TableHead>Poids (Kg)</TableHead>
            <TableHead>Dimensions (cm)</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Fragile</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={getImageSrc(product.image) || "/placeholder.svg"}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.unitPrice.toFixed(2)} €</TableCell>
              <TableCell>{product.weight} Kg</TableCell>
              <TableCell>{`${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>{product.packagingType}</TableCell>
              <TableCell>
                <Badge variant={product.isFragile ? "destructive" : "secondary"}>
                  {product.isFragile ? "Oui" : "Non"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddNewProduct
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onAdd={handleEditProduct}
        initialData={editingProduct}
      />
    </>
  )
}
