"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart4,
  ChevronDown,
  Download,
  LineChart,
  PieChart,
  Share2,
  TrendingUp,
  DollarSign,
  Filter,
  Search,
  ArrowRight,
  CreditCard,
  Receipt,
  Wallet,
  Percent,
  TrendingDown,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { DateRangePicker } from "@/components/date-range-picker"
import { useReportData } from "@/hooks/use-report-data"
import { ReportLastUpdated } from "@/components/report-last-updated"

export default function FinancialReportPage() {
  const [period, setPeriod] = useState("30j")
  const [service, setService] = useState("all")
  const [client, setClient] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [useCustomDateRange, setUseCustomDateRange] = useState(false)

  // Prepare params for API call
  const params = {
    type: "financial",
    period: useCustomDateRange ? "custom" : period,
    service,
    ...(useCustomDateRange &&
      dateRange?.from && {
        startDate: format(dateRange.from, "yyyy-MM-dd"),
      }),
    ...(useCustomDateRange &&
      dateRange?.to && {
        endDate: format(dateRange.to, "yyyy-MM-dd"),
      }),
  }

  // Fetch report data
  const { data, isLoading, error, lastUpdated, refresh } = useReportData(params)

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setUseCustomDateRange(true)
    } else {
      setUseCustomDateRange(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setPeriod("30j")
    setService("all")
    setClient("all")
    setSearchQuery("")
    setDateRange(undefined)
    setUseCustomDateRange(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapport Financier</h1>
          <p className="text-muted-foreground">Analyse détaillée des données financières</p>
        </div>
        
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#a22e2e]" />
          <span className="ml-2 text-lg">Chargement des données...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des données: {error}</AlertDescription>
        </Alert>
      )}

      {/* Content when data is loaded */}
      {!isLoading && !error && data && (
        <>
          {/* Last updated indicator */}
          <ReportLastUpdated lastUpdated={lastUpdated} isLoading={isLoading} onRefresh={refresh} />
          {/* KPIs */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50/50">
                <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.financial.totalRevenue.toLocaleString()} €</div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">+12.4%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={85} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50">
                <CardTitle className="text-sm font-medium">Marge brute</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Percent className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.financial.paymentRate.toFixed(1)}%</div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">+1.8%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={data.financial.paymentRate} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50/50">
                <CardTitle className="text-sm font-medium">Coûts opérationnels</CardTitle>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Wallet className="h-4 w-4 text-purple-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{(data.financial.totalRevenue * 0.65).toLocaleString()} €</div>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">-3.2%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={65} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50/50">
                <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Receipt className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.financial.unpaidAmount.toLocaleString()} €</div>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">-5.7%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress
                  value={(data.financial.unpaidAmount / data.financial.totalRevenue) * 100}
                  className="h-1 mt-3"
                />
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="services">Analyse par service</TabsTrigger>
              <TabsTrigger value="clients">Analyse par client</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Évolution du chiffre d'affaires</CardTitle>
                        <CardDescription>
                          Chiffre d'affaires mensuel sur les derniers mois (en milliers €)
                        </CardDescription>
                      </div>
                      <div className="p-1.5 bg-green-100 rounded-md">
                        <LineChart className="h-4 w-4 text-green-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-b from-green-50 to-transparent rounded-md p-4 flex items-end justify-between">
                        {data.financial.monthlyRevenue.map((item, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="bg-green-500 rounded-t-sm w-8"
                              style={{
                                height: `${Math.min(item.revenue / 1000, 200)}px`,
                              }}
                            ></div>
                            <span className="text-xs mt-2 text-muted-foreground">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Répartition des revenus</CardTitle>
                        <CardDescription>Distribution des revenus par méthode de paiement</CardDescription>
                      </div>
                      <div className="p-1.5 bg-blue-100 rounded-md">
                        <PieChart className="h-4 w-4 text-blue-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-32 h-32 rounded-full">
                            {Object.entries(data.financial.paymentMethodDistribution).map(
                              ([method, percentage], index) => {
                                const colors = ["blue-400", "green-400", "amber-400", "purple-400", "red-400"]
                                const color = colors[index % colors.length]
                                const startAngle =
                                  index === 0
                                    ? 0
                                    : Object.entries(data.financial.paymentMethodDistribution)
                                        .slice(0, index)
                                        .reduce((sum, [_, val]) => sum + Number(val), 0) * 3.6
                                const endAngle = startAngle + Number(percentage) * 3.6

                                return (
                                  <div
                                    key={method}
                                    className={`absolute inset-0 rounded-full border-8 border-${color}`}
                                    style={{
                                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((startAngle * Math.PI) / 180)}%, ${50 + 50 * Math.cos((endAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((endAngle * Math.PI) / 180)}%)`,
                                    }}
                                  ></div>
                                )
                              },
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center space-y-3">
                          {Object.entries(data.financial.paymentMethodDistribution).map(
                            ([method, percentage], index) => {
                              const colors = ["blue-400", "green-400", "amber-400", "purple-400", "red-400"]
                              const color = colors[index % colors.length]

                              return (
                                <div key={method} className="flex items-center">
                                  <div className={`w-3 h-3 bg-${color} rounded-full mr-2`}></div>
                                  <span className="text-sm">
                                    {method} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              )
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Top Clients</CardTitle>
                        <CardDescription>Clients générant le plus de revenus</CardDescription>
                      </div>
                      <div className="p-1.5 bg-purple-100 rounded-md">
                        <BarChart4 className="h-4 w-4 text-purple-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full space-y-6">
                        {data.financial.topClients.map((client, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{client.name}</span>
                              <span className="text-sm text-muted-foreground">{client.revenue.toLocaleString()} €</span>
                            </div>
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="bg-purple-500 h-full"
                                style={{
                                  width: `${(client.revenue / data.financial.topClients[0].revenue) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services">
              {/* Service-specific content would go here */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance financière par service</CardTitle>
                    <CardDescription>Analyse comparative des services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Chiffre d'affaires</TableHead>
                            <TableHead>Marge brute</TableHead>
                            <TableHead>Coûts</TableHead>
                            <TableHead>Rentabilité</TableHead>
                            <TableHead>Tendance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Dynamic data would be mapped here */}
                          <TableRow>
                            <TableCell className="font-medium">Transport Maritime</TableCell>
                            <TableCell>{(data.financial.totalRevenue * 0.4).toLocaleString()} €</TableCell>
                            <TableCell>30.5%</TableCell>
                            <TableCell>{(data.financial.totalRevenue * 0.4 * 0.695).toLocaleString()} €</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                Élevée
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <ArrowUpRight className="h-3 w-3 mr-1" /> En hausse
                              </Badge>
                            </TableCell>
                          </TableRow>
                          {/* Additional rows would follow */}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clients">
              {/* Client-specific content would go here */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Rentabilité par client</CardTitle>
                    <CardDescription>Analyse des principaux clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Chiffre d'affaires</TableHead>
                            <TableHead>Marge</TableHead>
                            <TableHead>Factures impayées</TableHead>
                            <TableHead>Délai de paiement</TableHead>
                            <TableHead>Rentabilité</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.financial.topClients.map((client, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{client.name}</TableCell>
                              <TableCell>{client.revenue.toLocaleString()} €</TableCell>
                              <TableCell>{(30 + Math.random() * 10).toFixed(1)}%</TableCell>
                              <TableCell>{(client.revenue * (Math.random() * 0.1)).toLocaleString()} €</TableCell>
                              <TableCell>{Math.floor(15 + Math.random() * 20)}j</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Élevée
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations financières</CardTitle>
              <CardDescription>Suggestions pour améliorer la performance financière</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h3 className="text-sm font-medium flex items-center text-blue-800">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Optimisation des délais de paiement
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Le délai moyen de paiement est 75% plus élevé que la moyenne du secteur. Envisagez de renégocier les
                    conditions de paiement ou d'offrir des remises pour paiement anticipé.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-800 mt-2" asChild>
                    <Link href="#">
                      Voir le plan d'action <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="text-sm font-medium flex items-center text-green-800">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Développement du service d'entreposage
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Le service d'entreposage présente la marge la plus élevée (38.7%). Une augmentation de 15% de ce
                    service pourrait générer 28,000 € de marge supplémentaire.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-green-800 mt-2" asChild>
                    <Link href="#">
                      Explorer les opportunités <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <h3 className="text-sm font-medium flex items-center text-amber-800">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Réduction des coûts de carburant
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Les coûts de carburant représentent 26% des dépenses totales. L'optimisation des itinéraires et
                    l'adoption de véhicules plus économes pourraient réduire ces coûts de 8-10%.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-amber-800 mt-2" asChild>
                    <Link href="#">
                      Voir les solutions <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
