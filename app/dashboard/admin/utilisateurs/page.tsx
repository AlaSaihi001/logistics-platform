"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Plus, Search, Download, RefreshCw } from "lucide-react"
import { useAuthSession } from "@/hooks/use-auth-session"

export default function AdminUsersPage() {
  const router = useRouter()
  const { requireAuth } = useAuthSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
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

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/users")

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs")
        }

        const data = await response.json()
        setUsers(data)
        setFilteredUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Impossible de charger les utilisateurs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query and active tab
  useEffect(() => {
    if (!users.length) return

    let filtered = users

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user: any) =>
          user.nom.toLowerCase().includes(query) ||
          user.prenom.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      )
    }

    // Filter by role
    if (activeTab !== "all") {
      filtered = filtered.filter((user: any) => user.role.toLowerCase() === activeTab)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, activeTab, users])

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

      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs")
      }

      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Error refreshing users:", error)
      setError("Impossible de recharger les utilisateurs")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/users/export")

      if (!response.ok) {
        throw new Error("Erreur lors de l'exportation des utilisateurs")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "utilisateurs.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error("Error exporting users:", error)
      setError("Impossible d'exporter les utilisateurs")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/dashboard/admin/utilisateurs/ajouter">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Link>
          </Button>
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
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>Gérez les utilisateurs de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="client">Clients</TabsTrigger>
                <TabsTrigger value="agent">Agents</TabsTrigger>
                <TabsTrigger value="assistant">Assistants</TabsTrigger>
                <TabsTrigger value="admin">Administrateurs</TabsTrigger>
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
                      <p className="text-muted-foreground">Tableau des utilisateurs</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="client" className="mt-4">
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
                      <p className="text-muted-foreground">Tableau des clients</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="agent" className="mt-4">
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
                      <p className="text-muted-foreground">Tableau des agents</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="assistant" className="mt-4">
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
                      <p className="text-muted-foreground">Tableau des assistants</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="admin" className="mt-4">
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
                      <p className="text-muted-foreground">Tableau des administrateurs</p>
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
