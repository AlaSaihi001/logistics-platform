"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Filter, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { StatusBadge } from "@/components/status-badge"

interface Order {
  id: string
  nom: string
  typeCommande: string
  dateDePickup: string
  typeTransport: string
  nomDestinataire: string
  valeurMarchandise: number
  status: string
  createdAt: string
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [transportFilter, setTransportFilter] = useState("all")
  const [uniqueTransportModes, setUniqueTransportModes] = useState<string[]>([])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/commandes")
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors du chargement des commandes (${response.status})`)
      }

      const data = await response.json()

      // Format the data
      const formattedOrders = data.map((order: any) => ({
        id: order.id.toString(),
        nom: order.nom,
        typeCommande: order.typeCommande,
        dateDePickup: new Date(order.dateDePickup).toLocaleDateString("fr-FR"),
        typeTransport: order.typeTransport,
        nomDestinataire: order.nomDestinataire,
        valeurMarchandise: order.valeurMarchandise,
        status: order.status,
        createdAt: new Date(order.createdAt).toLocaleDateString("fr-FR"),
      }))

      setOrders(formattedOrders)

      // Extract unique transport modes
      const transportModes = [...new Set(data.map((order: any) => order.typeTransport))]
      setUniqueTransportModes(transportModes)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des commandes")
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.nomDestinataire.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesTransport = transportFilter === "all" || order.typeTransport === transportFilter

    return matchesSearch && matchesStatus && matchesTransport
  })

  const handleSearch = () => {
    // Cette fonction est maintenue pour la compatibilité avec le bouton de recherche existant
    // La recherche est déjà effectuée en temps réel via le filtrage ci-dessus
    console.log("Search triggered with term:", searchTerm)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTransportFilter("all")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Gérez vos commandes et suivez leur état</p>
        </div>
        <Link href="/dashboard/client/commandes/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Commande
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Livrée">Livrée</SelectItem>
              <SelectItem value="Expédiée">Expédiée</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Annulée">Annulée</SelectItem>
              <SelectItem value="Archivée">Archivée</SelectItem>
            </SelectContent>
          </Select>

          <Select value={transportFilter} onValueChange={setTransportFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Transport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les transports</SelectItem>
              {uniqueTransportModes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="Rechercher" onClick={handleSearch} title="Rechercher">
            <Search className="h-4 w-4" />
            <span className="sr-only">Rechercher</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Réinitialiser les filtres"
            onClick={resetFilters}
            title="Réinitialiser les filtres"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Réinitialiser les filtres</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>Visualisez toutes vos commandes et leur statut</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Numéro de Commande</TableHead>
                  <TableHead className="font-medium">Nom de Commande</TableHead>
                  <TableHead className="font-medium">Mode de transport</TableHead>
                  <TableHead className="font-medium">Date de Commande</TableHead>
                  <TableHead className="font-medium">Fournisseur / Destinataire</TableHead>
                  <TableHead className="font-medium">Montant total</TableHead>
                  <TableHead className="font-medium">Statut</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.nom}</TableCell>
                      <TableCell>{order.typeTransport}</TableCell>
                      <TableCell>{order.dateDePickup}</TableCell>
                      <TableCell>{order.nomDestinataire}</TableCell>
                      <TableCell>{order.valeurMarchandise.toLocaleString()} €</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/client/commandes/${order.id}`}>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || transportFilter !== "all" ? (
                        <div>
                          <p>Aucune commande ne correspond à vos critères de recherche</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={resetFilters}>
                            Réinitialiser les filtres
                          </Button>
                        </div>
                      ) : (
                        <p>Vous n'avez pas encore de commandes</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
