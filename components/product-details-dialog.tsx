"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DoorClosedIcon as Close } from "lucide-react"
import Image from "next/image"

interface Product {
  id: number
  name: string
  category: string
  price: number
  weight: string
  dimensions: string
  quantity: number
  image?: string
}

interface ProductDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export function ProductDetailsDialog({ isOpen, onClose, product }: ProductDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails du produit</DialogTitle>
          <Close onClick={onClose} className="h-6 w-6 text-muted-foreground hover:text-muted" />
        </DialogHeader>
        <DialogDescription>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Nom du produit:</div>
              <div className="font-medium">{product.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Catégorie:</div>
              <div>{product.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Prix unitaire:</div>
              <div>{product.price}€</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Poids:</div>
              <div>{product.weight}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Dimensions:</div>
              <div>{product.dimensions}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Quantité:</div>
              <div>{product.quantity}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Image:</div>
              <div className="w-full h-32">
                {product.image && (
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="rounded" />
                )}
              </div>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
