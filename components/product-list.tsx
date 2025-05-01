"use client";

import type React from "react";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddNewProduct } from "@/components/add-new-product";

// Interface corrigée selon Prisma
interface ProductUI {
  id: number;
  nom: string;
  categorie?: string;
  tarifUnitaire: number;
  poids: number;
  largeur: number;
  longueur: number;
  hauteur: number;
  quantite: number;
  typeConditionnement: string;
  fragile: boolean;
  description?: string;
  image?: string | File;
  document?: string;
}

interface ProductListProps {
  products: ProductUI[];
  setProducts: React.Dispatch<React.SetStateAction<ProductUI[]>>;
}

export function ProductList({ products, setProducts }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<ProductUI | null>(null);

  const handleDeleteProduct = (productId: number) => {
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId)
    );
  };

  const handleEditProduct = (updatedProduct: ProductUI) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
  };

  const getImageSrc = (image?: string | File) => {
    if (!image) return "/placeholder.svg";
    if (typeof image === "string") {
      return image;
    }
    // If it's a File object
    return "/placeholder.svg";
  };

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
            <TableHead>Conditionnement</TableHead>
            <TableHead>Fragile</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={getImageSrc(product.image)}
                  alt={product.nom}
                  className="w-10 h-10 object-cover rounded"
                />
              </TableCell>
              <TableCell className="font-medium">{product.nom}</TableCell>
              <TableCell>{product.categorie || "-"}</TableCell>
              <TableCell>{product.tarifUnitaire.toFixed(2)} €</TableCell>
              <TableCell>{product.poids} Kg</TableCell>
              <TableCell>{`${product.longueur}x${product.largeur}x${product.hauteur}`}</TableCell>
              <TableCell>{product.quantite}</TableCell>
              <TableCell>{product.typeConditionnement}</TableCell>
              <TableCell>
                <Badge variant={product.fragile ? "destructive" : "secondary"}>
                  {product.fragile ? "Oui" : "Non"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
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
  );
}
