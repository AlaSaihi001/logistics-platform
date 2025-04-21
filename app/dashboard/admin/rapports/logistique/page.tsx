"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  LineChart,
  PieChart,
  Share2,
  Filter,
  Search,
  ArrowRight,
  Truck,
  Warehouse,
  Map,
  AlertTriangle,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ArrowDownRight,
  Loader2,
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

import { DateRangePicker } from "@/components/date-range-picker"
import { useReportData } from "@/hooks/use-report-data"
import { ReportLastUpdated } from "@/components/report-last-updated"

export default function LogisticsReportPage() {
  const [period, setPeriod] = useState("30j")
  const [region, setRegion] = useState("all")
  const [transport, setTransport] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [useCustomDateRange, setUseCustomDateRange] = useState(false)

  // Prepare params for API call
  const params = {
    type: "logistics",
    period: useCustomDateRange ? "custom" : period,
    region,
    service: transport,
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
    setRegion("all")
    setTransport("all")
    setSearchQuery("")
    setDateRange(undefined)
    setUseCustomDateRange(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapport Logistique</h1>
          <p className="text-muted-foreground">Analyse détaillée des opérations logistiques</p>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Exporter <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" /> Partager
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  <SelectItem value="north">Nord</SelectItem>
                  <SelectItem value="south">Sud</SelectItem>
                  <SelectItem value="east">Est</SelectItem>
                  <SelectItem value="west">Ouest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={transport} onValueChange={setTransport}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Mode de transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="maritime">Maritime</SelectItem>
                  <SelectItem value="air">Aérien</SelectItem>
                  <SelectItem value="road">Routier</SelectItem>
                  <SelectItem value="rail">Ferroviaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full sm:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Réinitialiser les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50">
                <CardTitle className="text-sm font-medium">Expéditions totales</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Truck className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.logistics.totalShipments}</div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">+8.4%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={84} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50/50">
                <CardTitle className="text-sm font-medium">Taux d'occupation</CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <Warehouse className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.logistics.averageWarehouseUtilization.toFixed(1)}%</div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">+3.2%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={data.logistics.averageWarehouseUtilization} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50/50">
                <CardTitle className="text-sm font-medium">Distance parcourue</CardTitle>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Map className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.logistics.totalDistance.toLocaleString()} km</div>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">-2.8%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={72} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-red-50/50">
                <CardTitle className="text-sm font-medium">Incidents logistiques</CardTitle>
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{data.logistics.incidentCount}</div>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">-5.7%</p>
                  <p className="text-xs text-muted-foreground ml-1">vs période précédente</p>
                </div>
                <Progress value={data.logistics.incidentCount} className="h-1 mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="transport">Analyse des transports</TabsTrigger>
              <TabsTrigger value="warehouse">Gestion des entrepôts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Expéditions par mode de transport</CardTitle>
                        <CardDescription>Répartition des expéditions par mode</CardDescription>
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
                            {Object.entries(data.logistics.transportModes).map(([mode, percentage], index) => {
                              const colors = ["blue-400", "green-400", "amber-400", "purple-400"]
                              const color = colors[index % colors.length]
                              const startAngle =
                                index === 0
                                  ? 0
                                  : Object.entries(data.logistics.transportModes)
                                      .slice(0, index)
                                      .reduce((sum, [_, val]) => sum + Number(val), 0) * 3.6
                              const endAngle = startAngle + Number(percentage) * 3.6

                              return (
                                <div
                                  key={mode}
                                  className={`absolute inset-0 rounded-full border-8 border-${color}`}
                                  style={{
                                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${
                                      50 + 50 * Math.sin((startAngle * Math.PI) / 180)
                                    }%, ${50 + 50 * Math.cos((endAngle * Math.PI) / 180)}% ${
                                      50 + 50 * Math.sin((endAngle * Math.PI) / 180)
                                    }%)`,
                                  }}
                                ></div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center space-y-3">
                          {Object.entries(data.logistics.transportModes).map(([mode, percentage], index) => {
                            const colors = ["blue-400", "green-400", "amber-400", "purple-400"]
                            const color = colors[index % colors.length]

                            return (
                              <div key={mode} className="flex items-center">
                                <div className={`w-3 h-3 bg-${color} rounded-full mr-2`}></div>
                                <span className="text-sm">
                                  {mode} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Utilisation des entrepôts</CardTitle>
                        <CardDescription>Taux d'occupation par entrepôt</CardDescription>
                      </div>
                      <div className="p-1.5 bg-green-100 rounded-md">
                        <LineChart className="h-4 w-4 text-green-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full space-y-6">
                        {data.logistics.warehouseUtilization.map((warehouse, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{warehouse.name}</span>
                              <span className="text-sm text-muted-foreground">{warehouse.utilization.toFixed(1)}%</span>
                            </div>
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full ${
                                  warehouse.utilization > 90
                                    ? "bg-red-500"
                                    : warehouse.utilization > 70
                                      ? "bg-green-500"
                                      : "bg-amber-500"
                                }`}
                                style={{ width: `${warehouse.utilization}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Incidents logistiques par type</CardTitle>
                        <CardDescription>Répartition des incidents par catégorie</CardDescription>
                      </div>
                      <div className="p-1.5 bg-red-100 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full space-y-6">
                        {Object.entries(data.logistics.incidentTypes).map(([type, count], index) => {
                          const percentage = (Number(count) / data.logistics.incidentCount) * 100

                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{type}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} incidents ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div className="bg-red-500 h-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transport">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance par mode de transport</CardTitle>
                    <CardDescription>Analyse comparative des différents modes de transport</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Mode de transport</TableHead>
                            <TableHead>Expéditions</TableHead>
                            <TableHead>Distance moyenne</TableHead>
                            <TableHead>Délai moyen</TableHead>
                            <TableHead>Coût par km</TableHead>
                            <TableHead>Incidents</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(data.logistics.transportModes).map(([mode, percentage], index) => {
                            const shipments = Math.round((percentage / 100) * data.logistics.totalShipments)
                            const incidents = Math.round(Math.random() * 10)
                            const avgDistance = Math.round(100 + Math.random() * 1500)
                            const avgDelay = (1 + Math.random() * 7).toFixed(1)
                            const costPerKm = (0.1 + Math.random() * 0.8).toFixed(2)

                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{mode}</TableCell>
                                <TableCell>{shipments}</TableCell>
                                <TableCell>{avgDistance} km</TableCell>
                                <TableCell>{avgDelay} jours</TableCell>
                                <TableCell>{costPerKm} €</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      incidents <= 3
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : incidents <= 6
                                          ? "bg-amber-100 text-amber-800 border-amber-200"
                                          : "bg-red-100 text-red-800 border-red-200"
                                    }
                                  >
                                    {incidents}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="warehouse">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance des entrepôts</CardTitle>
                    <CardDescription>Analyse comparative des entrepôts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Entrepôt</TableHead>
                            <TableHead>Capacité (m²)</TableHead>
                            <TableHead>Taux d'occupation</TableHead>
                            <TableHead>Rotation des stocks</TableHead>
                            <TableHead>Efficacité</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.logistics.warehouseUtilization.map((warehouse, index) => {
                            const rotation = (5 + Math.random() * 10).toFixed(1)
                            const efficiency =
                              warehouse.utilization > 90 ? "low" : warehouse.utilization < 70 ? "low" : "medium"
                            const status =
                              warehouse.utilization > 90
                                ? "critique"
                                : warehouse.utilization < 70
                                  ? "sous-utilisé"
                                  : "normal"

                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{warehouse.name}</TableCell>
                                <TableCell>{warehouse.capacity}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span className="font-medium mr-2">{warehouse.utilization.toFixed(1)}%</span>
                                    <Progress
                                      value={warehouse.utilization}
                                      className={`h-1 w-16 ${
                                        warehouse.utilization > 90
                                          ? "bg-red-100"
                                          : warehouse.utilization < 70
                                            ? "bg-amber-100"
                                            : "bg-green-100"
                                      }`}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>{rotation} jours</TableCell>
                                <TableCell>
                                  {efficiency === "high" ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                      Haute efficacité ({">"}90%)
                                    </Badge>
                                  ) : efficiency === "medium" ? (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                      Efficacité moyenne (70-90%)
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                      Faible efficacité ({"<"}70%)
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {status === "optimal" ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                      <CheckCircle className="mr-1 h-3 w-3" /> Optimal
                                    </Badge>
                                  ) : status === "normal" ? (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                      <Clock className="mr-1 h-3 w-3" /> Normal
                                    </Badge>
                                  ) : status === "critique" ? (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                      <AlertTriangle className="mr-1 h-3 w-3" /> Critique
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                      <XCircle className="mr-1 h-3 w-3" /> Sous-utilisé
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
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
              <CardTitle>Recommandations d'optimisation</CardTitle>
              <CardDescription>Suggestions pour améliorer les opérations logistiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h3 className="text-sm font-medium flex items-center text-blue-800">
                    <Truck className="h-4 w-4 mr-2" />
                    Optimisation des itinéraires
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    L'analyse des itinéraires montre que 15% des trajets routiers pourraient être optimisés pour réduire
                    la distance parcourue de 8%. Cela représenterait une économie potentielle de 12,500€ par mois.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-800 mt-2" asChild>
                    <Link href="#">
                      Voir les itinéraires optimisés <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="text-sm font-medium flex items-center text-green-800">
                    <Warehouse className="h-4 w-4 mr-2" />
                    Rééquilibrage des stocks
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Certains entrepôts sont proches de leur capacité maximale tandis que d'autres sont sous-utilisés. Un
                    transfert stratégique des stocks optimiserait l'utilisation des espaces et réduirait les coûts de
                    stockage.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-green-800 mt-2" asChild>
                    <Link href="#">
                      Plan de rééquilibrage <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <h3 className="text-sm font-medium flex items-center text-amber-800">
                    <Package className="h-4 w-4 mr-2" />
                    Réduction des incidents
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    L'analyse des incidents logistiques montre que la majorité sont liés à des retards de livraison et
                    des dommages pendant le transport. L'implémentation d'un système de suivi en temps réel pourrait
                    réduire ces incidents de 40%.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-amber-800 mt-2" asChild>
                    <Link href="#">
                      Solutions de tracking <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/admin/rapports">Retour aux rapports</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/admin/rapports/logistique/export">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter le rapport complet
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
