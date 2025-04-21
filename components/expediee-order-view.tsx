"use client"

import { useState } from "react"
import Image from "next/image"
import { AlertTriangle, FileText, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ProductDetailsDialog } from "@/components/product-details-dialog"

interface Product {
  id: number
  name: string
  category: string
  price: number
  weight: string
  dimensions: string
  quantity: number
  image?: string
  description?: string
  packaging?: string
  isFragile?: boolean
  unitPrice?: number
}

interface Order {
  id: number
  number: string
  name: string
  status: string
  date: string
  transport?: {
    departure?: {
      name?: string
      code?: string
      date?: string
    }
    arrival?: {
      name?: string
      code?: string
      date?: string
    }
  }
  products?: Product[]
  notes?: string[]
}

interface ExpedieeOrderViewProps {
  order: Order
}

export function ExpedieeOrderView({ order }: ExpedieeOrderViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  if (!order) {
    return <div>Données de commande non disponibles</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Commande - {order.number || "N/A"}</h1>
        <Button variant="outline">Imprimer commande</Button>
      </div>

      {/* Localisation & Suivi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Localisation & Suivi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="text-center mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-500">{order.transport?.departure?.name || "N/A"}</span>
              </div>
              <div className="text-2xl font-bold mt-1">{order.transport?.departure?.code || "N/A"}</div>
              <div className="mt-2 text-sm text-gray-500">Date de départ</div>
              <div className="font-medium">{order.transport?.departure?.date || "N/A"}</div>
            </div>

            <div className="flex-1 px-8 mt-4 hidden md:block">
              <Progress value={75} className="h-2" />
              <div className="mt-2 text-center text-sm text-blue-500">En transit</div>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-500">{order.transport?.arrival?.name || "N/A"}</span>
              </div>
              <div className="text-2xl font-bold mt-1">{order.transport?.arrival?.code || "N/A"}</div>
              <div className="mt-2 text-sm text-gray-500">Date d'arrivée estimée</div>
              <div className="font-medium">{order.transport?.arrival?.date || "N/A"}</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              Position actuelle: <span className="font-medium">Ouest de la Méditerranée</span>
            </div>
            <Button variant="outline" size="sm" className="text-blue-700">
              Voir sur la carte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des Produits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-lg bg-gray-100">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name || "N/A"}</TableCell>
                    <TableCell>{product.category || "N/A"}</TableCell>
                    <TableCell>{product.price ? `${product.price}€` : "N/A"}</TableCell>
                    <TableCell>{product.weight || "N/A"}</TableCell>
                    <TableCell>{product.dimensions || "N/A"}</TableCell>
                    <TableCell>{product.quantity || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                        Voir détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.notes?.map((note, index) => (
              <div key={index} className="flex items-start gap-2 text-blue-700">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Facture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facture</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Télécharger la facture
            </Button>
          </CardContent>
        </Card>

        {/* Support Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Image src="/placeholder.svg" alt="Support Agent" width={48} height={48} className="rounded-full" />
              <div>
                <div className="font-medium">Sarah Dubois</div>
                <div className="text-sm text-gray-500">Agent de support</div>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div>Email: support@cargo.com</div>
              <div>Tél: +33 1 23 45 67 89</div>
            </div>
            <Button variant="outline" className="w-full">
              Contacter le support
            </Button>
          </CardContent>
        </Card>
      </div>
      {selectedProduct && (
        <ProductDetailsDialog
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </div>
  )
}
