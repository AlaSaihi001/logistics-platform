"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Search, Download, RefreshCw, Filter } from "lucide-react"
import { useAuthSession } from "@/hooks/use-auth-session"

export default function AdminPaymentsPage() {
  const router = useRouter()
  const { requireAuth } = useAuthSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [activeTab, setActiveTab] = useState("all")

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthorized = await requireAuth(["ADMIN"])
      if (!isAuthorized) {
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [requireAuth, router])

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/payments")

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des paiements")
        }

        const data = await response.json()
        setPayments(data)
        setFilteredPayments(data)
      } catch (error) {
        console.error("Error fetching payments:", error)
        setError("Impossible de charger les paiements")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [])

  // Filter payments based on search query and active tab
  useEffect(() => {
    if (!payments.length) return

    let filtered = payments

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (payment: any) =>
          payment.reference.toLowerCase().includes(query) ||
          payment.client.nom.toLowerCase().includes(query) ||
          payment.client.prenom.toLowerCase().includes(query),
      )
    }

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter((payment: any) => payment.status.toLowerCase() === activeTab)
    }

    setFilteredPayments(filtered)
  }, [searchQuery, activeTab, payments])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/payments")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des paiements")
      }

      const data = await response.json()
      setPayments(data)
      setFilteredPayments(data)
    } catch (error) {
      console.error("Error refreshing payments:", error)
      setError("Impossible de recharger les paiements")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/payments/export")

      if (!response.ok) {
        throw new Error("Erreur lors de l'exportation des paiements")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "paiements.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error("Error exporting payments:", error)
      setError("Impossible d'exporter les paiements")
    }
  }

  // Handle date range change
  const handleDateRangeChange = async (dateRange: { from: Date; to: Date }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des paiements")
      }

      const data = await response.json()
      setPayments(data)
      setFilteredPayments(data)
    } catch (error) {
      console.error("Error fetching payments with date range:", error)
      setError("Impossible de charger les paiements")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des paiements</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <DateRangePicker onChange={handleDateRangeChange} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paiements</CardTitle>
          <CardDescription>Gérez les paiements de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un paiement..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="payé">Payés</TabsTrigger>
                <TabsTrigger value="en attente">En attente</TabsTrigger>
                <TabsTrigger value="en retard">En retard</TabsTrigger>
                <TabsTrigger value="annulé">Annulés</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Tableau des paiements</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="payé" className="mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Tableau des paiements payés</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="en attente" className="mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Tableau des paiements en attente</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="en retard" className="mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Tableau des paiements en retard</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="annulé" className="mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Tableau des paiements annulés</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
