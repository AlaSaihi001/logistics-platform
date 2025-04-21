"use client"

import { useState, useEffect } from "react"
import { Package, FileText, Receipt, Clock, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/stats-card"
import { StatusBadge } from "@/components/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { DateRangePicker } from "@/components/date-range-picker"

// Types for our data
interface Expedition {
  id: string
  client: string
  date: string
  status: string
}

interface Document {
  id: string
  type: string
  expedition: string
  status: string
}

interface DashboardStats {
  expeditionsEnCours: number
  documentsAValider: number
  facturesAEnvoyer: number
  expeditionsUrgentes: number
  expeditionsTrend: { value: number; isPositive: boolean }
  documentsTrend: { value: number; isPositive: boolean }
  facturesTrend: { value: number; isPositive: boolean }
  urgentesTrend: { value: number; isPositive: boolean }
}

export default function AgentDashboardPage() {
  const [activeTab, setActiveTab] = useState("apercu")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // State for our data
  const [stats, setStats] = useState<DashboardStats>({
    expeditionsEnCours: 0,
    documentsAValider: 0,
    facturesAEnvoyer: 0,
    expeditionsUrgentes: 0,
    expeditionsTrend: { value: 0, isPositive: true },
    documentsTrend: { value: 0, isPositive: true },
    facturesTrend: { value: 0, isPositive: true },
    urgentesTrend: { value: 0, isPositive: true },
  })
  const [urgentExpeditions, setUrgentExpeditions] = useState<Expedition[]>([])
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([])
  const [recentExpeditions, setRecentExpeditions] = useState<Expedition[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch dashboard stats
        const statsResponse = await fetch("/api/agent/dashboard/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateFrom: dateRange.from.toISOString(),
            dateTo: dateRange.to.toISOString(),
          }),
        })

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const statsData = await statsResponse.json()
        setStats(statsData)

        // Fetch urgent expeditions
        const urgentResponse = await fetch("/api/agent/dashboard/urgent-expeditions")
        if (!urgentResponse.ok) {
          throw new Error("Failed to fetch urgent expeditions")
        }

        const urgentData = await urgentResponse.json()
        setUrgentExpeditions(urgentData)

        // Fetch pending documents
        const documentsResponse = await fetch("/api/agent/dashboard/pending-documents")
        if (!documentsResponse.ok) {
          throw new Error("Failed to fetch pending documents")
        }

        const documentsData = await documentsResponse.json()
        setPendingDocuments(documentsData)

        // Fetch recent expeditions
        const recentResponse = await fetch("/api/agent/dashboard/recent-expeditions")
        if (!recentResponse.ok) {
          throw new Error("Failed to fetch recent expeditions")
        }

        const recentData = await recentResponse.json()
        setRecentExpeditions(recentData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer.")
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les données du tableau de bord.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [dateRange, toast])

  // Fallback data for development/demo purposes
  const fallbackUrgentExpeditions = [
    { id: "EXP-2023-089", client: "TechGlobal", date: "15/03/2023", status: "en-cours" },
    { id: "EXP-2023-092", client: "MediPharma", date: "18/03/2023", status: "en-cours" },
    { id: "EXP-2023-095", client: "FoodExpress", date: "20/03/2023", status: "en-cours" },
  ]

  const fallbackPendingDocuments = [
    { id: "DOC-2023-045", type: "Certificat d'origine", expedition: "EXP-2023-089", status: "a-valider" },
    { id: "DOC-2023-046", type: "Facture commerciale", expedition: "EXP-2023-092", status: "a-valider" },
    { id: "DOC-2023-047", type: "Certificat sanitaire", expedition: "EXP-2023-095", status: "a-valider" },
  ]

  const fallbackRecentExpeditions = [
    { id: "EXP-2023-089", client: "TechGlobal", date: "15/03/2023", status: "en-cours" },
    { id: "EXP-2023-088", client: "FashionRetail", date: "14/03/2023", status: "expedie" },
    { id: "EXP-2023-087", client: "AutoParts", date: "12/03/2023", status: "livre" },
    { id: "EXP-2023-086", client: "HomeDecor", date: "10/03/2023", status: "annule" },
  ]

  // Use fallback data if loading or error
  const displayUrgentExpeditions = isLoading || error ? fallbackUrgentExpeditions : urgentExpeditions
  const displayPendingDocuments = isLoading || error ? fallbackPendingDocuments : pendingDocuments
  const displayRecentExpeditions = isLoading || error ? fallbackRecentExpeditions : recentExpeditions

  // Fallback stats
  const fallbackStats = {
    expeditionsEnCours: 12,
    documentsAValider: 7,
    facturesAEnvoyer: 4,
    expeditionsUrgentes: 3,
    expeditionsTrend: { value: 8, isPositive: true },
    documentsTrend: { value: 12, isPositive: false },
    facturesTrend: { value: 4, isPositive: true },
    urgentesTrend: { value: 2, isPositive: false },
  }

  // Use fallback stats if loading or error
  const displayStats = isLoading || error ? fallbackStats : stats

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#074e6e]">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue sur votre tableau de bord, Agent Logistique</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-2 bg-[#074e6e] hover:bg-[#074e6e]/90">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Générer un rapport</span>
          </Button>
        </div>
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

      <Tabs defaultValue="apercu" className="space-y-4" onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-auto bg-[#074e6e]/10">
            <TabsTrigger value="apercu" className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white">
              Aperçu
            </TabsTrigger>
            <TabsTrigger
              value="expeditions"
              className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white"
            >
              Expéditions
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white">
              Documents
            </TabsTrigger>
            <TabsTrigger value="factures" className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white">
              Factures
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="apercu" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Expéditions en cours"
              value={displayStats.expeditionsEnCours.toString()}
              icon={Package}
              trend={displayStats.expeditionsTrend}
              isLoading={isLoading}
            />
            <StatsCard
              title="Documents à valider"
              value={displayStats.documentsAValider.toString()}
              icon={FileText}
              trend={displayStats.documentsTrend}
              isLoading={isLoading}
            />
            <StatsCard
              title="Factures à envoyer"
              value={displayStats.facturesAEnvoyer.toString()}
              icon={Receipt}
              trend={displayStats.facturesTrend}
              isLoading={isLoading}
            />
            <StatsCard
              title="Expéditions urgentes"
              value={displayStats.expeditionsUrgentes.toString()}
              icon={AlertTriangle}
              trend={displayStats.urgentesTrend}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-none shadow-md">
              <CardHeader className="border-b border-[#074e6e]/10">
                <CardTitle className="text-[#074e6e]">Expéditions par mois</CardTitle>
                <CardDescription>Nombre d'expéditions traitées par mois</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] flex items-center justify-center bg-[#074e6e]/5 rounded-md">
                  {isLoading ? (
                    <div className="animate-pulse flex flex-col items-center justify-center">
                      <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 w-48 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Graphique en barres des expéditions</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-none shadow-md">
              <CardHeader className="border-b border-[#074e6e]/10">
                <CardTitle className="text-[#074e6e]">État des factures</CardTitle>
                <CardDescription>Répartition des factures par statut</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] flex items-center justify-center bg-[#074e6e]/5 rounded-md">
                  {isLoading ? (
                    <div className="animate-pulse flex flex-col items-center justify-center">
                      <div className="h-32 w-32 bg-gray-300 rounded-full mb-4"></div>
                      <div className="h-4 w-48 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Graphique camembert des factures</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#074e6e]/10">
                <CardTitle className="text-lg font-medium text-[#074e6e]">Expéditions urgentes</CardTitle>
                <Clock className="h-4 w-4 text-[#074e6e]" />
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-2">
                        <div>
                          <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 w-32 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayUrgentExpeditions.map((expedition) => (
                      <div
                        key={expedition.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#074e6e]/5"
                      >
                        <div>
                          <p className="font-medium">{expedition.id}</p>
                          <p className="text-sm text-muted-foreground">{expedition.client}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={expedition.status as any} />
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-[#074e6e]/10 hover:text-[#074e6e]"
                          >
                            <Link href={`/dashboard/agent/expeditions/${expedition.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-[#074e6e]/10 p-4">
                <Button
                  variant="outline"
                  className="w-full hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                  asChild
                >
                  <Link href="/dashboard/agent/expeditions">Voir toutes les expéditions</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#074e6e]/10">
                <CardTitle className="text-lg font-medium text-[#074e6e]">Documents en attente</CardTitle>
                <FileText className="h-4 w-4 text-[#074e6e]" />
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-2">
                        <div>
                          <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 w-32 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayPendingDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#074e6e]/5"
                      >
                        <div>
                          <p className="font-medium">{document.id}</p>
                          <p className="text-sm text-muted-foreground">{document.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={document.status as any} />
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-[#074e6e]/10 hover:text-[#074e6e]"
                          >
                            <Link href={`/dashboard/agent/documents/${document.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-[#074e6e]/10 p-4">
                <Button
                  variant="outline"
                  className="w-full hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                  asChild
                >
                  <Link href="/dashboard/agent/documents">Voir tous les documents</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expeditions" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-[#074e6e]/10">
              <CardTitle className="text-[#074e6e]">Expéditions récentes</CardTitle>
              <CardDescription>Liste des dernières expéditions traitées</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#074e6e]/10">
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index} className="border-b border-[#074e6e]/10">
                            <TableCell>
                              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse ml-auto"></div>
                            </TableCell>
                          </TableRow>
                        ))
                    : displayRecentExpeditions.map((expedition) => (
                        <TableRow key={expedition.id} className="border-b border-[#074e6e]/10 hover:bg-[#074e6e]/5">
                          <TableCell className="font-medium">{expedition.id}</TableCell>
                          <TableCell>{expedition.client}</TableCell>
                          <TableCell>{expedition.date}</TableCell>
                          <TableCell>
                            <StatusBadge status={expedition.status as any} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                            >
                              <Link href={`/dashboard/agent/expeditions/${expedition.id}`}>Détails</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t border-[#074e6e]/10 p-4">
              <Button
                variant="outline"
                className="w-full hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                asChild
              >
                <Link href="/dashboard/agent/expeditions">Voir toutes les expéditions</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-[#074e6e]/10">
              <CardTitle className="text-[#074e6e]">Documents à valider</CardTitle>
              <CardDescription>Documents en attente de validation</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#074e6e]/10">
                    <TableHead>Numéro</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Expédition</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index} className="border-b border-[#074e6e]/10">
                            <TableCell>
                              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse ml-auto"></div>
                            </TableCell>
                          </TableRow>
                        ))
                    : [
                        {
                          id: "DOC-2023-045",
                          type: "Certificat d'origine",
                          expedition: "EXP-2023-089",
                          status: "a-valider",
                        },
                        {
                          id: "DOC-2023-046",
                          type: "Facture commerciale",
                          expedition: "EXP-2023-092",
                          status: "a-valider",
                        },
                        {
                          id: "DOC-2023-047",
                          type: "Certificat sanitaire",
                          expedition: "EXP-2023-095",
                          status: "a-valider",
                        },
                        { id: "DOC-2023-044", type: "Bon de livraison", expedition: "EXP-2023-088", status: "valide" },
                      ].map((document) => (
                        <TableRow key={document.id} className="border-b border-[#074e6e]/10 hover:bg-[#074e6e]/5">
                          <TableCell className="font-medium">{document.id}</TableCell>
                          <TableCell>{document.type}</TableCell>
                          <TableCell>{document.expedition}</TableCell>
                          <TableCell>
                            <StatusBadge status={document.status as any} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                            >
                              <Link href={`/dashboard/agent/documents/${document.id}`}>Détails</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t border-[#074e6e]/10 p-4">
              <Button
                variant="outline"
                className="w-full hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                asChild
              >
                <Link href="/dashboard/agent/documents">Voir tous les documents</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="factures" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-[#074e6e]/10">
              <CardTitle className="text-[#074e6e]">Factures récentes</CardTitle>
              <CardDescription>Liste des dernières factures émises</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#074e6e]/10">
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index} className="border-b border-[#074e6e]/10">
                            <TableCell>
                              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse ml-auto"></div>
                            </TableCell>
                          </TableRow>
                        ))
                    : [
                        { id: "FAC-2023-056", client: "TechGlobal", amount: "1,250.00 €", status: "en-attente" },
                        { id: "FAC-2023-055", client: "FashionRetail", amount: "3,450.00 €", status: "payee" },
                        { id: "FAC-2023-054", client: "AutoParts", amount: "2,780.00 €", status: "en-retard" },
                        { id: "FAC-2023-053", client: "HomeDecor", amount: "1,890.00 €", status: "payee" },
                      ].map((facture) => (
                        <TableRow key={facture.id} className="border-b border-[#074e6e]/10 hover:bg-[#074e6e]/5">
                          <TableCell className="font-medium">{facture.id}</TableCell>
                          <TableCell>{facture.client}</TableCell>
                          <TableCell>{facture.amount}</TableCell>
                          <TableCell>
                            <StatusBadge status={facture.status as any} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                            >
                              <Link href={`/dashboard/agent/factures/${facture.id}`}>Détails</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t border-[#074e6e]/10 p-4">
              <Button
                variant="outline"
                className="w-full hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                asChild
              >
                <Link href="/dashboard/agent/factures">Voir toutes les factures</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
