"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, Filter, Download, Send, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Types for our data
interface Facture {
  id: string
  expedition: string
  client: string
  amount: string
  issueDate: string
  dueDate: string
  status: string
}

export default function FacturesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [factures, setFactures] = useState<Facture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const commandeFilter = searchParams.get("commande")

  // Fetch factures data
  useEffect(() => {
    const fetchFactures = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let url = "/api/agent/factures"
        if (commandeFilter) {
          url += `?commande=${commandeFilter}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch invoices")
        }

        const data = await response.json()
        setFactures(data)
      } catch (err) {
        console.error("Error fetching invoices:", err)
        setError("Une erreur est survenue lors du chargement des factures. Veuillez réessayer.")
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les factures.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFactures()
  }, [commandeFilter, toast])

  // Fallback data for development/demo purposes
  const fallbackFactures = [
    {
      id: "FAC-2023-056",
      expedition: "EXP-2023-089",
      client: "TechGlobal",
      amount: "1,250.00 €",
      issueDate: "15/03/2023",
      dueDate: "15/04/2023",
      status: "en-attente",
    },
    {
      id: "FAC-2023-055",
      expedition: "EXP-2023-088",
      client: "FashionRetail",
      amount: "3,450.00 €",
      issueDate: "14/03/2023",
      dueDate: "14/04/2023",
      status: "payee",
    },
    {
      id: "FAC-2023-054",
      expedition: "EXP-2023-087",
      client: "AutoParts",
      amount: "2,780.00 €",
      issueDate: "12/03/2023",
      dueDate: "12/04/2023",
      status: "en-retard",
    },
    {
      id: "FAC-2023-053",
      expedition: "EXP-2023-086",
      client: "HomeDecor",
      amount: "1,890.00 €",
      issueDate: "10/03/2023",
      dueDate: "10/04/2023",
      status: "payee",
    },
    {
      id: "FAC-2023-052",
      expedition: "EXP-2023-085",
      client: "ElectroTech",
      amount: "4,320.00 €",
      issueDate: "08/03/2023",
      dueDate: "08/04/2023",
      status: "en-attente",
    },
  ]

  // Use fallback data if loading or error
  const displayFactures = isLoading || error ? fallbackFactures : factures

  // Filter factures based on search term and status filter
  const filteredFactures = displayFactures.filter((facture) => {
    const matchesSearch =
      facture.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.expedition.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || facture.status === statusFilter

    // If there's a commande filter in the URL, only show factures for that commande
    const matchesCommande = !commandeFilter || facture.expedition === commandeFilter

    return matchesSearch && matchesStatus && matchesCommande
  })

  // Handle sending an invoice
  const handleSendInvoice = async (factureId: string) => {
    try {
      const response = await fetch(`/api/agent/factures/${factureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "envoyer" }),
      })

      if (!response.ok) {
        throw new Error("Failed to send invoice")
      }

      toast({
        title: "Facture envoyée",
        description: "La facture a été envoyée au client avec succès.",
      })

      // Update the local state to reflect the change
      setFactures((prevFactures) =>
        prevFactures.map((facture) => (facture.id === factureId ? { ...facture, status: "en-attente" } : facture)),
      )
    } catch (err) {
      console.error("Error sending invoice:", err)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer la facture. Veuillez réessayer.",
      })
    }
  }

  // Handle reminding a client about an overdue invoice
  const handleRemindClient = async (factureId: string) => {
    try {
      const response = await fetch(`/api/agent/factures/${factureId}/remind`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to send reminder")
      }

      toast({
        title: "Rappel envoyé",
        description: "Un rappel a été envoyé au client.",
      })
    } catch (err) {
      console.error("Error sending reminder:", err)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le rappel. Veuillez réessayer.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
        <p className="text-muted-foreground">Gérez les factures des expéditions</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>Consultez et gérez toutes les factures</CardDescription>
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
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en-attente">En attente</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="en-retard">En retard</SelectItem>
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
                  <TableHead className="w-[120px]">Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Expédition</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="hidden lg:table-cell">Date d'émission</TableHead>
                  <TableHead className="hidden lg:table-cell">Date d'échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredFactures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFactures.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="font-medium">{facture.id}</TableCell>
                      <TableCell>{facture.client}</TableCell>
                      <TableCell className="hidden md:table-cell">{facture.expedition}</TableCell>
                      <TableCell>{facture.amount}</TableCell>
                      <TableCell className="hidden lg:table-cell">{facture.issueDate}</TableCell>
                      <TableCell className="hidden lg:table-cell">{facture.dueDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={facture.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/agent/factures/${facture.id}`}>Voir</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">PDF</span>
                          </Button>
                          {facture.status === "en-attente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => handleSendInvoice(facture.id)}
                            >
                              <Send className="h-4 w-4" />
                              <span className="hidden sm:inline">Envoyer</span>
                            </Button>
                          )}
                          {facture.status === "en-retard" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700"
                              onClick={() => handleRemindClient(facture.id)}
                            >
                              <Bell className="h-4 w-4" />
                              <span className="hidden sm:inline">Relancer</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
