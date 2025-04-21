"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, TrendingUp, Truck, DollarSign, Users, Clock, ArrowRight, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useReportData } from "@/hooks/use-report-data"

export default function ReportsPage() {
  const [period, setPeriod] = useState("30j")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [useCustomDateRange, setUseCustomDateRange] = useState(false)

  // Prepare params for API call
  const params = {
    type: "overview",
    period: useCustomDateRange ? "custom" : period,
    ...(useCustomDateRange &&
      dateRange?.from && {
        startDate: format(dateRange.from, "yyyy-MM-dd"),
      }),
    ...(useCustomDateRange &&
      dateRange?.to && {
        endDate: format(dateRange.to, "yyyy-MM-dd"),
      }),
  }

  // Fetch report data with 5-minute refresh interval (300000ms)
  const { data, isLoading, error, lastUpdated, refresh } = useReportData(params, 300000)

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setUseCustomDateRange(true)
    } else {
      setUseCustomDateRange(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord des rapports</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances de l'entreprise</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod} disabled={useCustomDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7j">7 jours</SelectItem>
              <SelectItem value="30j">30 jours</SelectItem>
              <SelectItem value="90j">90 jours</SelectItem>
              <SelectItem value="1a">1 an</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          <Button variant="outline" size="icon" onClick={refresh} title="Rafraîchir les données">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-sm text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Dernière mise à jour: {format(lastUpdated, "dd/MM/yyyy HH:mm:ss")}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="reports">Rapports détaillés</TabsTrigger>
          <TabsTrigger value="custom">Rapports personnalisés</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>Erreur lors du chargement des données: {error}</p>
              <Button variant="outline" className="mt-2" onClick={refresh}>
                Réessayer
              </Button>
            </div>
          ) : data ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Performance Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>Indicateurs clés de performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Livraisons à temps</span>
                    <span className="font-medium">{data.kpis?.onTimeRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Délai moyen</span>
                    <span className="font-medium">{data.kpis?.avgDeliveryTime.toFixed(1)} jours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Efficacité des agents</span>
                    <span className="font-medium">{data.kpis?.agentEfficiency.toFixed(1)}%</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/admin/rapports/performance">
                      Voir le rapport détaillé <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Financial Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Finances</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>Indicateurs financiers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chiffre d'affaires</span>
                    <span className="font-medium">{data.financial?.totalRevenue.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux de paiement</span>
                    <span className="font-medium">{data.financial?.paymentRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Factures impayées</span>
                    <span className="font-medium">{data.financial?.unpaidAmount.toLocaleString()} €</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/admin/rapports/financiers">
                      Voir le rapport détaillé <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Logistics Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Logistique</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>Opérations logistiques</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Expéditions</span>
                    <span className="font-medium">{data.logistics?.totalShipments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux d'occupation</span>
                    <span className="font-medium">{data.logistics?.averageWarehouseUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Incidents</span>
                    <span className="font-medium">{data.logistics?.incidentCount}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/admin/rapports/logistique">
                      Voir le rapport détaillé <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Status Distribution Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Statut des commandes</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>Distribution par statut</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En attente</span>
                    <span className="font-medium">{data.statusDistribution?.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En cours</span>
                    <span className="font-medium">{data.statusDistribution?.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Livrées</span>
                    <span className="font-medium">{data.statusDistribution?.delivered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annulées</span>
                    <span className="font-medium">{data.statusDistribution?.cancelled}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/admin/commandes">
                      Voir toutes les commandes <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Top Agents Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Agents</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>Agents les plus performants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.agentPerformance?.slice(0, 3).map((agent, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{agent.name}</span>
                      <span className="font-medium">{agent.efficiency.toFixed(1)}%</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/admin/utilisateurs">
                      Voir tous les agents <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Top Clients Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Clients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>Clients générant le plus de revenus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.financial?.topClients?.slice(0, 3).map((client, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{client.name}</span>
                      <span className="font-medium">{client.revenue.toLocaleString()} €</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/admin/clients">
                      Voir tous les clients <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Rapport de Performance</CardTitle>
                <CardDescription>Analyse des performances opérationnelles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualisez les indicateurs clés de performance, l'efficacité des agents, les taux de livraison à temps
                  et plus encore.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/dashboard/admin/rapports/performance">Consulter le rapport</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rapport Financier</CardTitle>
                <CardDescription>Analyse des données financières</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explorez le chiffre d'affaires, les marges, les coûts opérationnels, les factures impayées et plus
                  encore.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/dashboard/admin/rapports/financiers">Consulter le rapport</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rapport Logistique</CardTitle>
                <CardDescription>Analyse des opérations logistiques</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Examinez les expéditions, l'utilisation des entrepôts, les modes de transport, les incidents et plus
                  encore.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/dashboard/admin/rapports/logistique">Consulter le rapport</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Créer un rapport personnalisé</CardTitle>
              <CardDescription>Sélectionnez les métriques et les dimensions pour votre rapport</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cette fonctionnalité vous permet de créer des rapports sur mesure en sélectionnant les métriques et
                dimensions qui vous intéressent.
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4">
                <p className="text-sm">Cette fonctionnalité sera disponible prochainement.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
