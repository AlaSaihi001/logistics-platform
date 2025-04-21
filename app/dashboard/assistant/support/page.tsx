"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Filter, Calendar, CheckCircle, MessageSquare, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuthSession } from "@/hooks/use-auth-session"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Ticket {
  id: string
  client: string
  sujet: string
  dateCreation: string
  status: string
}

export default function SupportPage() {
  const { isLoading: authLoading, requireAuth } = useAuthSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [ticketsList, setTicketsList] = useState<Ticket[]>([])
  const [originalTickets, setOriginalTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [submitting, setSubmitting] = useState(false)
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null)

  // Check authentication and role
  const checkAuthorization = useCallback(async () => {
    try {
      setIsAuthorized(await requireAuth(["ASSISTANT"]))
    } catch (error) {
      setError("Erreur d'authentification. Veuillez vous reconnecter.")
      console.error("Authentication error:", error)
    }
  }, [requireAuth])

  useEffect(() => {
    checkAuthorization()
  }, [checkAuthorization])

  // Fetch tickets data
  useEffect(() => {
    const fetchTickets = async () => {
      if (!isAuthorized) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/assistant/reclamations", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Erreur lors du chargement des tickets")
        }

        const data = await response.json()
        setOriginalTickets(data)
        setTicketsList(data)

        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage))
      } catch (error) {
        console.error("Error fetching tickets:", error)
        setError(error instanceof Error ? error.message : "Erreur lors du chargement des tickets")
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Impossible de charger les tickets",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [isAuthorized, toast, itemsPerPage])

  // Apply filters
  useEffect(() => {
    if (originalTickets.length === 0) return

    const filtered = originalTickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter

      const matchesDate = !dateFilter || ticket.dateCreation === format(dateFilter, "dd/MM/yyyy")

      return matchesSearch && matchesStatus && matchesDate
    })

    setTicketsList(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setPage(1) // Reset to first page when filters change
  }, [searchTerm, statusFilter, dateFilter, originalTickets, itemsPerPage])

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter(undefined)
  }

  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/assistant/reclamations", {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Erreur lors du chargement des tickets")
      }

      const data = await response.json()
      setOriginalTickets(data)
      
      // Apply current filters to new data
      const filtered = data.filter((ticket: Ticket) => {
        const matchesSearch =
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter

        const matchesDate = !dateFilter || ticket.dateCreation === format(dateFilter, "dd/MM/yyyy")

        return matchesSearch && matchesStatus && matchesDate
      })
      
      setTicketsList(filtered)
      setTotalPages(Math.ceil(filtered.length / itemsPerPage))

      toast({
        title: "Données actualisées",
        description: "La liste des tickets a été mise à jour.",
      })
    } catch (error) {
      console.error("Error refreshing tickets:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de l'actualisation des tickets")
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'actualiser les tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mark ticket as resolved
  const markAsResolved = async (id: string) => {
    try {
      setSubmitting(true)
      setResolvingTicketId(id)
      
      const response = await fetch(`/api/assistant/reclamations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolu",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Erreur lors de la mise à jour du statut")
      }

      // Update local state
      setTicketsList(ticketsList.map((ticket) => (ticket.id === id ? { ...ticket, status: "resolu" } : ticket)))
      
      toast({
        title: "Ticket résolu",
        description: `Le ticket ${id} a été marqué comme résolu avec succès.`,
      })
    } catch (error) {
      console.error("Error resolving ticket:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de résoudre le ticket",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      setResolvingTicketId(null)
    }
  }

  // Pagination
  const paginatedTickets = ticketsList.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAuthorized && error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur d'authentification</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href="/auth/assistant/login">Se reconnecter</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Client</h1>
          <p className="text-muted-foreground">Gérez les tickets de support des clients</p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button onClick={refreshData} variant="outline" size="sm" className="w-fit">
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des tickets</CardTitle>
          <CardDescription>Consultez et gérez tous les tickets de support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en-attente">En attente</SelectItem>
                  <SelectItem value="resolu">Résolu</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Filtrer par date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="icon" onClick={resetFilters} title="Réinitialiser les filtres">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Réinitialiser les filtres</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID Ticket</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Aucun ticket trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.client}</TableCell>
                      <TableCell>{ticket.sujet}</TableCell>
                      <TableCell>{ticket.dateCreation}</TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/assistant/support/${ticket.id}`}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Détails
                            </Link>
                          </Button>

                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/assistant/support/${ticket.id}`}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Répondre
                            </Link>
                          </Button>

                          {ticket.status === "en-attente" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                  disabled={submitting && resolvingTicketId === ticket.id}
                                >
                                  {submitting && resolvingTicketId === ticket.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  <span className="hidden sm:inline">Résolu</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Marquer comme résolu</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir marquer ce ticket comme résolu ? Cette action ne peut pas
                                    être annulée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => markAsResolved(ticket.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={submitting}
                                  >
                                    {submitting && resolvingTicketId === ticket.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Traitement...
                                      </>
                                    ) : (
                                      "Confirmer"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Précédent
              </Button>
              <div className="text-sm text-muted-\
\
