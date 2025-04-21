"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  ArrowRight,
  CreditCard,
  Settings,
  Download,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  PlusCircle,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { DashboardShell, DashboardHeader, DashboardContent } from "@/components/ui/dashboard-shell"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

// Type definitions aligned with class diagram
interface Order {
  id: string
  nom: string
  typeTransport: string
  dateDePickup: string
  nomDestinataire: string
  status: string
  valeurMarchandise: number
  dateCommande: string
}

interface Invoice {
  id: string
  numeroFacture: number
  dateEmission: string
  montant: number
  status: string
  commande: {
    id: string
    nom: string
  }
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [transportFilter, setTransportFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    delivered: 0,
    shipped: 0,
    pending: 0,
    cancelled: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([])
  const [uniqueTransportModes, setUniqueTransportModes] = useState<string[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch orders
        const ordersResponse = await fetch("/api/client/commandes")
        if (!ordersResponse.ok) {
          throw new Error(`Erreur lors du chargement des commandes: ${ordersResponse.status}`)
        }
        const ordersData = await ordersResponse.json()

        // Calculate stats
        const stats = {
          delivered: ordersData.filter((order: any) => order.status === "Livrée").length,
          shipped: ordersData.filter((order: any) => order.status === "Expédiée").length,
          pending: ordersData.filter((order: any) => order.status === "En attente").length,
          cancelled: ordersData.filter((order: any) => order.status === "Annulée").length,
        }
        setStats(stats)

        // Extract unique transport modes
        const transportModes = [...new Set(ordersData.map((order: any) => order.typeTransport))]
        setUniqueTransportModes(transportModes)

        // Get recent orders (last 5)
        const recent = ordersData
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((order: any) => ({
            id: order.id.toString(),
            nom: order.nom,
            typeTransport: order.typeTransport,
            dateDePickup: new Date(order.dateDePickup).toLocaleDateString("fr-FR"),
            nomDestinataire: order.nomDestinataire,
            status: order.status,
            valeurMarchandise: order.valeurMarchandise,
            dateCommande: new Date(order.createdAt).toLocaleDateString("fr-FR"),
          }))
        setRecentOrders(recent)

        // Fetch invoices
        const invoicesResponse = await fetch("/api/client/factures?status=En attente,En retard")
        if (!invoicesResponse.ok) {
          throw new Error(`Erreur lors du chargement des factures: ${invoicesResponse.status}`)
        }
        const invoicesData = await invoicesResponse.json()

        // Get pending invoices
        const pending = invoicesData
          .filter((invoice: any) => ["En attente", "En retard"].includes(invoice.status))
          .map((invoice: any) => ({
            id: invoice.id.toString(),
            numeroFacture: invoice.numeroFacture,
            dateEmission: new Date(invoice.dateEmission).toLocaleDateString("fr-FR"),
            montant: invoice.montant,
            status: invoice.status,
            commande: {
              id: invoice.commande.id.toString(),
              nom: invoice.commande.nom,
            },
          }))
        setPendingInvoices(pending)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des données")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Filtrer les commandes récentes en fonction des critères de recherche et de filtrage
  const filteredRecentOrders = recentOrders.filter((order) => {
    const matchesSearch =
      order.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.nomDestinataire.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesTransport = transportFilter === "all" || order.typeTransport === transportFilter

    return matchesSearch && matchesStatus && matchesTransport
  })

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En attente":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="mr-1 h-3 w-3" /> En attente
          </Badge>
        )
      case "Expédiée":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Truck className="mr-1 h-3 w-3" /> Expédié
          </Badge>
        )
      case "Livrée":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Livré
          </Badge>
        )
      case "Annulée":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Annulé
          </Badge>
        )
      case "En retard":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> En retard
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Fonction pour réessayer le chargement des données
  const handleRetry = () => {
    setLoading(true)
    setError(null)
    // Réinitialiser les filtres
    setSearchTerm("")
    setStatusFilter("all")
    setTransportFilter("all")

    // Recharger les données
    const fetchDashboardData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await fetch("/api/client/commandes")
        if (!ordersResponse.ok) throw new Error("Erreur lors du chargement des commandes")
        const ordersData = await ordersResponse.json()

        // Calculate stats
        const stats = {
          delivered: ordersData.filter((order: any) => order.status === "Livrée").length,
          shipped: ordersData.filter((order: any) => order.status === "Expédiée").length,
          pending: ordersData.filter((order: any) => order.status === "En attente").length,
          cancelled: ordersData.filter((order: any) => order.status === "Annulée").length,
        }
        setStats(stats)

        // Extract unique transport modes
        const transportModes = [...new Set(ordersData.map((order: any) => order.typeTransport))]
        setUniqueTransportModes(transportModes)

        // Get recent orders (last 5)
        const recent = ordersData
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((order: any) => ({
            id: order.id.toString(),
            nom: order.nom,
            typeTransport: order.typeTransport,
            dateDePickup: new Date(order.dateDePickup).toLocaleDateString("fr-FR"),
            nomDestinataire: order.nomDestinataire,
            status: order.status,
            valeurMarchandise: order.valeurMarchandise,
            dateCommande: new Date(order.createdAt).toLocaleDateString("fr-FR"),
          }))
        setRecentOrders(recent)

        // Fetch invoices
        const invoicesResponse = await fetch("/api/client/factures?status=En attente,En retard")
        if (!invoicesResponse.ok) throw new Error("Erreur lors du chargement des factures")
        const invoicesData = await invoicesResponse.json()

        // Get pending invoices
        const pending = invoicesData
          .filter((invoice: any) => ["En attente", "En retard"].includes(invoice.status))
          .map((invoice: any) => ({
            id: invoice.id.toString(),
            numeroFacture: invoice.numeroFacture,
            dateEmission: new Date(invoice.dateEmission).toLocaleDateString("fr-FR"),
            montant: invoice.montant,
            status: invoice.status,
            commande: {
              id: invoice.commande.id.toString(),
              nom: invoice.commande.nom,
            },
          }))
        setPendingInvoices(pending)

        toast({
          title: "Succès",
          description: "Les données ont été rechargées avec succès",
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des données")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tableau de bord"
        description={`Bienvenue ${user?.name || ""}! Voici un aperçu de votre activité sur la plateforme`}
      />

      <DashboardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-4" onClick={handleRetry}>
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Indicateurs de synthèse */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatCard
                title="Commandes livrées"
                value={stats.delivered.toString()}
                icon={CheckCircle}
                colorScheme="green"
              />
              <StatCard title="Commandes expédiées" value={stats.shipped.toString()} icon={Truck} colorScheme="blue" />
              <StatCard
                title="Commandes en attente"
                value={stats.pending.toString()}
                icon={Clock}
                colorScheme="amber"
              />
              <StatCard
                title="Commandes annulées"
                value={stats.cancelled.toString()}
                icon={XCircle}
                colorScheme="red"
              />
            </>
          )}
        </div>

        {/* Section "Support Client" */}
        <Card>
          <CardHeader>
            <CardTitle>Support Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p>
                <strong>Téléphone :</strong> +216 99 99 99 99
              </p>
              <p>
                <strong>Email :</strong> support@cargo.com
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/client/profil">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Modifier les paramètres du compte
                </Button>
              </Link>
              <Link href="/dashboard/client/factures">
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Voir toutes les factures
                </Button>
              </Link>
              <Link href="/dashboard/client/commandes/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter Nouvelle Commande
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dernières commandes passées */}
        <Card>
          <CardHeader>
            <CardTitle>Dernières commandes passées</CardTitle>
            <CardDescription>Vos 5 dernières commandes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Rechercher..."
                      className="w-full md:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Expédiée">Expédié</SelectItem>
                        <SelectItem value="Livrée">Livré</SelectItem>
                        <SelectItem value="Annulée">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={transportFilter} onValueChange={setTransportFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrer par transport" />
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setTransportFilter("all")
                      }}
                      title="Réinitialiser les filtres"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {filteredRecentOrders.length > 0 ? (
                  <DataTable
                    data={filteredRecentOrders}
                    columns={[
                      { header: "Numéro de commande", accessorKey: "id", className: "font-medium" },
                      { header: "Nom de la commande", accessorKey: "nom" },
                      { header: "Mode de transport", accessorKey: "typeTransport" },
                      { header: "Date de commande", accessorKey: "dateCommande" },
                      { header: "Fournisseur/Destinataire", accessorKey: "nomDestinataire" },
                      {
                        header: "Statut",
                        accessorKey: "status",
                        cell: (item) => getStatusBadge(item.status),
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        className: "text-right",
                        cell: (item) => (
                          <Link href={`/dashboard/client/commandes/${item.id}`}>
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </Link>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div className="text-center py-10 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">Aucune commande ne correspond à vos critères de recherche</p>
                    {(searchTerm || statusFilter !== "all" || transportFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setTransportFilter("all")
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/client/commandes">
                Voir toutes les commandes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Factures en attente et en retard */}
        <Card>
          <CardHeader>
            <CardTitle>Factures en attente et en retard</CardTitle>
            <CardDescription>Vos factures impayées</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <>
                {pendingInvoices.length > 0 ? (
                  <DataTable
                    data={pendingInvoices}
                    columns={[
                      { header: "Numéro de facture", accessorKey: "numeroFacture", className: "font-medium" },
                      {
                        header: "Commande associée",
                        accessorKey: "commande",
                        cell: (item) => (
                          <Link href={`/dashboard/client/commandes/${item.commande.id}`} className="hover:underline">
                            {item.commande.nom}
                          </Link>
                        ),
                      },
                      { header: "Date d'émission", accessorKey: "dateEmission" },
                      {
                        header: "Montant total (€)",
                        accessorKey: "montant",
                        cell: (item) => `${item.montant.toFixed(2)} €`,
                      },
                      {
                        header: "Statut du paiement",
                        accessorKey: "status",
                        cell: (item) => (
                          <Badge
                            variant="outline"
                            className={
                              item.status === "En retard"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-orange-100 text-orange-800 border-orange-200"
                            }
                          >
                            {item.status === "En retard" ? (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" /> {item.status}
                              </>
                            ) : (
                              <>
                                <Clock className="mr-1 h-3 w-3" /> {item.status}
                              </>
                            )}
                          </Badge>
                        ),
                      },
                      {
                        header: "Actions",
                        accessorKey: "id",
                        className: "text-right",
                        cell: (item) => (
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/client/factures/${item.id}`}>
                              <Button variant="outline" size="sm">
                                Détails
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div className="text-center py-10 border rounded-md bg-muted/20">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-muted-foreground">Vous n'avez aucune facture en attente de paiement</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/client/factures">
                Voir toutes les factures
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </DashboardContent>
    </DashboardShell>
  )
}
