"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  Download,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Loader2,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { addDays } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

// Type definitions
type ClaimStatus = "Ouverte" | "En traitement" | "Résolue" | "Clôturée"
type ClaimPriority = "haute" | "moyenne" | "basse"

interface Claim {
  id: string
  client: {
    id: string
    nom: string
    email: string
  }
  commande?: string
  date: string
  sujet: string
  description: string
  priorite: ClaimPriority
  statut: ClaimStatus
  assigneA: string | null
}

export default function ReclamationsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const claimsPerPage = 10

  // Stats
  const [stats, setStats] = useState({
    totalClaims: 0,
    openClaims: 0,
    inProgressClaims: 0,
    resolvedClaims: 0,
    highPriorityClaims: 0,
  })

  // Fetch claims from the backend
  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Build query params
        const params = new URLSearchParams()
        if (statusFilter !== "all") {
          params.append("status", statusFilter)
        }
        if (priorityFilter !== "all") {
          params.append("priority", priorityFilter)
        }
        if (dateRange.from) {
          params.append("from", dateRange.from.toISOString())
        }
        if (dateRange.to) {
          params.append("to", dateRange.to.toISOString())
        }

        const response = await fetch(`/api/admin/claims?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des réclamations: ${response.status}`)
        }

        const data = await response.json()
        setClaims(data)

        // Calculate stats
        setStats({
          totalClaims: data.length,
          openClaims: data.filter((c: Claim) => c.statut === "Ouverte").length,
          inProgressClaims: data.filter((c: Claim) => c.statut === "En traitement").length,
          resolvedClaims: data.filter((c: Claim) => c.statut === "Résolue").length,
          highPriorityClaims: data.filter((c: Claim) => c.priorite === "haute").length,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les réclamations. Veuillez réessayer.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClaims()
  }, [statusFilter, priorityFilter, dateRange])

  // Filter claims based on search term
  useEffect(() => {
    let result = claims

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (claim) =>
          claim.id.toLowerCase().includes(term) ||
          claim.client.nom.toLowerCase().includes(term) ||
          claim.sujet.toLowerCase().includes(term),
      )
    }

    setFilteredClaims(result)
    setTotalPages(Math.ceil(result.length / claimsPerPage))
    setCurrentPage(1) // Reset to first page when filters changerrentPage(1) // Reset to first page when filters change
  }, [claims, searchTerm])

  // Handle claim status update
  const handleUpdateStatus = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${response.status}`)
      }

      // Update local state
      setClaims(claims.map((claim) => (claim.id === claimId ? { ...claim, statut: newStatus } : claim)))

      toast({
        title: "Statut mis à jour",
        description: `La réclamation a été marquée comme "${newStatus}".`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut. Veuillez réessayer.",
      })
    }
  }

  // Handle claim assignment
  const handleAssignClaim = async (claimId: string) => {
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de l'assignation: ${response.status}`)
      }

      const data = await response.json()

      // Update local state
      setClaims(claims.map((claim) => (claim.id === claimId ? { ...claim, assigneA: data.assignedTo } : claim)))

      toast({
        title: "Réclamation assignée",
        description: "La réclamation vous a été assignée avec succès.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'assigner la réclamation. Veuillez réessayer.",
      })
    }
  }

  // Export claims data
  const handleExportClaims = async () => {
    try {
      // Build query params
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (priorityFilter !== "all") {
        params.append("priority", priorityFilter)
      }
      if (dateRange.from) {
        params.append("from", dateRange.from.toISOString())
      }
      if (dateRange.to) {
        params.append("to", dateRange.to.toISOString())
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/admin/claims/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Erreur lors de l'exportation: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reclamations-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      setIsExportDialogOpen(false)

      toast({
        title: "Exportation réussie",
        description: "Les données ont été exportées avec succès.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'exporter les données. Veuillez réessayer.",
      })
    }
  }

  // Pagination
  const paginatedClaims = filteredClaims.slice((currentPage - 1) * claimsPerPage, currentPage * claimsPerPage)

  // Function to get the priority badge
  const getPriorityBadge = (priority: ClaimPriority) => {
    switch (priority) {
      case "haute":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="mr-1 h-3 w-3" /> Haute
          </Badge>
        )
      case "moyenne":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Clock className="mr-1 h-3 w-3" /> Moyenne
          </Badge>
        )
      case "basse":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Basse
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Function to get the status badge
  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "Ouverte":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Ouverte
          </Badge>
        )
      case "En traitement":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            En traitement
          </Badge>
        )
      case "Résolue":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Résolue
          </Badge>
        )
      case "Clôturée":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Clôturée
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Réclamations</h1>
          <p className="text-muted-foreground">Traitez et résolvez les problèmes signalés par les clients</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsDateRangeOpen(true)}>
            <Calendar className="h-4 w-4" />
            <span>Période</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques des réclamations */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total réclamations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaims}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ouvertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openClaims}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressClaims}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedClaims}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Haute priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityClaims}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des réclamations</CardTitle>
          <CardDescription>Consultez et gérez toutes les réclamations des clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Rechercher par ID, client ou sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Ouverte">Ouvert</SelectItem>
                  <SelectItem value="En traitement">En traitement</SelectItem>
                  <SelectItem value="Résolue">Résolu</SelectItem>
                  <SelectItem value="Clôturée">Clôturé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrer</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Commande</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Assigné à</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Chargement des réclamations...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      Aucune réclamation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={claim.client.nom} />
                            <AvatarFallback>
                              {claim.client.nom
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden md:block">
                            <p className="text-sm font-medium">{claim.client.nom}</p>
                            <p className="text-xs text-muted-foreground">{claim.client.email}</p>
                          </div>
                          <div className="md:hidden">
                            <p className="text-sm font-medium">{claim.client.nom}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{claim.commande || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{claim.date}</TableCell>
                      <TableCell>{claim.sujet}</TableCell>
                      <TableCell>{getPriorityBadge(claim.priorite)}</TableCell>
                      <TableCell>{getStatusBadge(claim.statut)}</TableCell>
                      <TableCell className="hidden md:table-cell">{claim.assigneA ? claim.assigneA : "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/reclamations/${claim.id}`} className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Voir détails
                              </Link>
                            </DropdownMenuItem>
                            {claim.statut !== "Résolue" && claim.statut !== "Clôturée" && (
                              <>
                                <DropdownMenuItem onClick={() => handleAssignClaim(claim.id)}>
                                  <User className="mr-2 h-4 w-4" />
                                  {claim.assigneA ? "Réassigner à moi" : "Assigner à moi"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(claim.id, "Résolue")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Marquer comme résolu
                                </DropdownMenuItem>
                              </>
                            )}
                            {claim.statut === "Résolue" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(claim.id, "Clôturée")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Clôturer la réclamation
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {paginatedClaims.length} réclamations sur {filteredClaims.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Suivant
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialog pour sélectionner la période */}
      <Dialog open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sélectionner une période</DialogTitle>
            <DialogDescription>Choisissez une plage de dates pour filtrer les réclamations</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDateRangeOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsDateRangeOpen(false)}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour exporter les données */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exporter les réclamations</DialogTitle>
            <DialogDescription>Choisissez les options d'exportation</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Format d'exportation</Label>
              <Select defaultValue="csv">
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Choisir un format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-data">Données à inclure</Label>
              <Select defaultValue="all">
                <SelectTrigger id="export-data">
                  <SelectValue placeholder="Choisir les données" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les données</SelectItem>
                  <SelectItem value="filtered">Données filtrées uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExportClaims}>Exporter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Label component
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
