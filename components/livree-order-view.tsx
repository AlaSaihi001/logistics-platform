"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FileText, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
    vessel?: {
      name?: string
      id?: string
      company?: string
    }
  }
  products?: Product[]
}

interface LivreeOrderViewProps {
  order: Order
}

export function LivreeOrderView({ order }: LivreeOrderViewProps) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleConfirmReception = () => {
    if (confirm("Êtes-vous sûr de vouloir confirmer la réception de cette commande ?")) {
      // Récupérer les commandes existantes
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")

      // Mettre à jour le statut de la commande à "archivée"
      const updatedOrders = existingOrders.map((o: Order) => {
        if (o.id === order.id) {
          return { ...o, status: "archivée" }
        }
        return o
      })

      // Sauvegarder les commandes mises à jour
      localStorage.setItem("orders", JSON.stringify(updatedOrders))

      // Rediriger vers le tableau des commandes
      router.push("/dashboard/client/commandes")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Commandes</h1>

      {/* General Information */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informations Générales sur la Commande</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Numéro de Commande:</div>
              <div>{order.number}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Nom de Commande:</div>
              <div>{order.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Statut:</div>
              <div className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Livrée
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date de Commande:</div>
              <div>{order.date}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Tracking */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Localisation & Suivi</h2>
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-4 md:mb-0">
              <div className="text-blue-600">Départ de {order.transport?.departure?.name ?? "N/A"}</div>
              <div className="text-2xl font-bold mt-1">{order.transport?.departure?.code ?? "N/A"}</div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">Date de Départ</div>
                <div>{order.transport?.departure?.date ?? "N/A"}</div>
              </div>
            </div>

            <div className="flex-1 px-8 mt-4 hidden md:block">
              <div className="h-2 bg-green-100 rounded-full relative">
                <div className="absolute inset-y-0 left-0 bg-green-600 rounded-full w-full" />
              </div>
            </div>

            <div className="text-right">
              <div className="text-blue-600">Arrivé à {order.transport?.arrival?.name ?? "N/A"}</div>
              <div className="text-2xl font-bold mt-1">{order.transport?.arrival?.code ?? "N/A"}</div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">Date de Livraison</div>
                <div>{order.transport?.arrival?.date ?? "N/A"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Liste des Produits</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image du produit</TableHead>
                  <TableHead>Nom de produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Tarif (€)</TableHead>
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
                      <div className="w-12 h-12 bg-gray-200 rounded">
                        {product.image && (
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}€</TableCell>
                    <TableCell>{product.weight}</TableCell>
                    <TableCell>{product.dimensions}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Button variant="secondary" size="sm" onClick={() => setSelectedProduct(product)}>
                        Détails
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
        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Évaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star key={rating} className="h-8 w-8 text-yellow-400 cursor-pointer" fill="currentColor" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice */}
        <Card>
          <CardHeader>
            <CardTitle>Facture</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Facture_Commande.pdf
            </Button>
          </CardContent>
        </Card>

        {/* Transport Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de Transport</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Nom du bateau/avion:</span> {order.transport?.vessel?.name ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Numéro d'identification:</span> {order.transport?.vessel?.id ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Compagnie de transport:</span> {order.transport?.vessel?.company ?? "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support Client</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-4">
          <Image src="/placeholder.svg" alt="Support Agent" width={64} height={64} className="rounded-full" />
          <div>
            <div className="font-medium">Samia Allagui</div>
            <div className="text-sm text-gray-500">
              <div>Numéro de Téléphone: +216 99 99 99 99</div>
              <div>Email: support@cargo.com</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button className="bg-green-500 hover:bg-green-600" onClick={handleConfirmReception}>
          Confirmer la réception
        </Button>
      </div>

      {/* Product Details Dialog */}
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
