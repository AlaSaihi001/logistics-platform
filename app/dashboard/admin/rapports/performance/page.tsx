"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart4,
  ChevronDown,
  Download,
  LineChart,
  PieChart,
  Share2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ArrowRight,
  MapPin,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { DateRangePicker } from "@/components/date-range-picker";
import { useReportData } from "@/hooks/use-report-data";
import { ReportLastUpdated } from "@/components/report-last-updated";

export default function PerformanceReportPage() {
  const [period, setPeriod] = useState("30j");
  const [region, setRegion] = useState("all");
  const [service, setService] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);

  // Prepare params for API call
  const params = {
    type: "performance",
    period: useCustomDateRange ? "custom" : period,
    region,
    service,
    ...(useCustomDateRange &&
      dateRange?.from && {
        startDate: format(dateRange.from, "yyyy-MM-dd"),
      }),
    ...(useCustomDateRange &&
      dateRange?.to && {
        endDate: format(dateRange.to, "yyyy-MM-dd"),
      }),
  };

  // Fetch report data
  const { data, isLoading, error, lastUpdated, refresh } =
    useReportData(params);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setUseCustomDateRange(true);
    } else {
      setUseCustomDateRange(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setPeriod("30j");
    setRegion("all");
    setService("all");
    setSearchQuery("");
    setDateRange(undefined);
    setUseCustomDateRange(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Rapport de Performance
          </h1>
          <p className="text-muted-foreground">
            Analyse détaillée des performances opérationnelles
          </p>
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
          <AlertDescription>
            Erreur lors du chargement des données: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Content when data is loaded */}
      {!isLoading && !error && data && (
        <>
          {/* Last updated indicator */}
          <ReportLastUpdated
            lastUpdated={lastUpdated}
            isLoading={isLoading}
            onRefresh={refresh}
          />

          {/* KPIs */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50/50">
                <CardTitle className="text-sm font-medium">
                  Taux de livraison à temps
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {data.kpis.onTimeRate.toFixed(1)}%
                </div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">+2.4%</p>
                  <p className="text-xs text-muted-foreground ml-1">
                    vs période précédente
                  </p>
                </div>
                <Progress value={data.kpis.onTimeRate} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50">
                <CardTitle className="text-sm font-medium">
                  Délai moyen de livraison
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {data.kpis.avgDeliveryTime.toFixed(1)} jours
                </div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">-0.5j</p>
                  <p className="text-xs text-muted-foreground ml-1">
                    vs période précédente
                  </p>
                </div>
                <Progress value={75} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50/50">
                <CardTitle className="text-sm font-medium">
                  Efficacité des agents
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-4 w-4 text-purple-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {data.kpis.agentEfficiency.toFixed(1)}%
                </div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">+3.1%</p>
                  <p className="text-xs text-muted-foreground ml-1">
                    vs période précédente
                  </p>
                </div>
                <Progress
                  value={data.kpis.agentEfficiency}
                  className="h-1 mt-3"
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-red-50/50">
                <CardTitle className="text-sm font-medium">
                  Taux d'erreurs
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-full">
                  <XCircle className="h-4 w-4 text-red-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {data.kpis.errorRate.toFixed(1)}%
                </div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500 font-medium">-0.7%</p>
                  <p className="text-xs text-muted-foreground ml-1">
                    vs période précédente
                  </p>
                </div>
                <Progress value={data.kpis.errorRate} className="h-1 mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="regional">Analyse régionale</TabsTrigger>
              <TabsTrigger value="service">Analyse par service</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Évolution du taux de livraison</CardTitle>
                        <CardDescription>
                          Pourcentage de livraisons à temps sur les derniers
                          mois
                        </CardDescription>
                      </div>
                      <div className="p-1.5 bg-blue-100 rounded-md">
                        <LineChart className="h-4 w-4 text-blue-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-b from-blue-50 to-transparent rounded-md p-4 flex items-end justify-between">
                        {data.monthlyTrends.map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div
                              className="bg-blue-500 rounded-t-sm w-6"
                              style={{ height: `${(item.count / 10) * 20}px` }}
                            ></div>
                            <span className="text-xs mt-2 text-muted-foreground">
                              {item.month}
                            </span>
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
                        <CardTitle>Répartition des délais</CardTitle>
                        <CardDescription>
                          Distribution des délais de livraison
                        </CardDescription>
                      </div>
                      <div className="p-1.5 bg-purple-100 rounded-md">
                        <PieChart className="h-4 w-4 text-purple-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-32 h-32 rounded-full">
                            {Object.entries(data.deliveryTimeDistribution).map(
                              ([time, percentage], index) => {
                                const colors = [
                                  "green-400",
                                  "blue-400",
                                  "amber-400",
                                  "red-400",
                                ];
                                const color = colors[index % colors.length];
                                const startAngle =
                                  index === 0
                                    ? 0
                                    : Object.entries(
                                        data.deliveryTimeDistribution
                                      )
                                        .slice(0, index)
                                        .reduce(
                                          (sum, [_, val]) => sum + Number(val),
                                          0
                                        ) * 3.6;
                                const endAngle =
                                  startAngle + Number(percentage) * 3.6;

                                return (
                                  <div
                                    key={time}
                                    className={`absolute inset-0 rounded-full border-8 border-${color}`}
                                    style={{
                                      clipPath: `polygon(50% 50%, ${
                                        50 +
                                        50 *
                                          Math.cos((startAngle * Math.PI) / 180)
                                      }% ${
                                        50 +
                                        50 *
                                          Math.sin((startAngle * Math.PI) / 180)
                                      }%, ${
                                        50 +
                                        50 *
                                          Math.cos((endAngle * Math.PI) / 180)
                                      }% ${
                                        50 +
                                        50 *
                                          Math.sin((endAngle * Math.PI) / 180)
                                      }%)`,
                                    }}
                                  ></div>
                                );
                              }
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center space-y-3">
                          {Object.entries(data.deliveryTimeDistribution).map(
                            ([time, percentage], index) => {
                              const colors = [
                                "green-400",
                                "blue-400",
                                "amber-400",
                                "red-400",
                              ];
                              const color = colors[index % colors.length];

                              return (
                                <div key={time} className="flex items-center">
                                  <div
                                    className={`w-3 h-3 bg-${color} rounded-full mr-2`}
                                  ></div>
                                  <span className="text-sm">
                                    {time} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              );
                            }
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
                        <CardTitle>Performance des agents</CardTitle>
                        <CardDescription>
                          Efficacité par agent (commandes traitées par jour)
                        </CardDescription>
                      </div>
                      <div className="p-1.5 bg-green-100 rounded-md">
                        <BarChart4 className="h-4 w-4 text-green-700" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-full space-y-6">
                        {data.agentPerformance.map((agent, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {agent.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {agent.total} commandes
                              </span>
                            </div>
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full ${
                                  agent.efficiency > 90
                                    ? "bg-green-500"
                                    : agent.efficiency > 80
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${agent.efficiency}%` }}
                              ></div>
                            </div>
                            <div className="flex text-xs">
                              <span>
                                Efficacité: {agent.efficiency.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance par région</CardTitle>
                    <CardDescription>
                      Comparaison des indicateurs clés par région
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Région</TableHead>
                            <TableHead>Livraisons à temps</TableHead>
                            <TableHead>Délai moyen</TableHead>
                            <TableHead>Efficacité</TableHead>
                            <TableHead>Taux d'erreurs</TableHead>
                            <TableHead>Tendance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Dynamic data would be mapped here */}
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                Nord
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium">96.2%</span>
                                <Progress
                                  value={96.2}
                                  className="h-1 w-16 ml-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>1.8 jours</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium">89%</span>
                                <Progress
                                  value={89}
                                  className="h-1 w-16 ml-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>1.2%</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 border-green-200"
                              >
                                <ArrowUpRight className="h-3 w-3 mr-1" /> En
                                hausse
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

            <TabsContent value="service">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance par service</CardTitle>
                    <CardDescription>
                      Comparaison des indicateurs clés par type de service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Livraisons à temps</TableHead>
                            <TableHead>Délai moyen</TableHead>
                            <TableHead>Efficacité</TableHead>
                            <TableHead>Taux d'erreurs</TableHead>
                            <TableHead>Tendance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Dynamic data would be mapped here */}
                          <TableRow>
                            <TableCell className="font-medium">
                              Transport Maritime
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium">92.5%</span>
                                <Progress
                                  value={92.5}
                                  className="h-1 w-16 ml-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>3.2 jours</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium">85%</span>
                                <Progress
                                  value={85}
                                  className="h-1 w-16 ml-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>2.1%</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 border-green-200"
                              >
                                <ArrowUpRight className="h-3 w-3 mr-1" /> En
                                hausse
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
          </Tabs>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'amélioration</CardTitle>
              <CardDescription>
                Suggestions basées sur l'analyse des performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h3 className="text-sm font-medium flex items-center text-blue-800">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimisation des délais de livraison
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Les délais de livraison dans la région Sud sont 28% plus
                    élevés que la moyenne. Envisagez de revoir les itinéraires
                    et d'augmenter les ressources dans cette zone.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-800 mt-2"
                    asChild
                  >
                    <Link href="#">
                      Voir le plan d'action détaillé{" "}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="text-sm font-medium flex items-center text-green-800">
                    <Users className="h-4 w-4 mr-2" />
                    Formation des agents
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Les agents avec moins de 6 mois d'expérience ont une
                    efficacité 15% inférieure. Un programme de mentorat pourrait
                    améliorer leurs performances.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-green-800 mt-2"
                    asChild
                  >
                    <Link href="#">
                      Consulter le programme de formation{" "}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <h3 className="text-sm font-medium flex items-center text-amber-800">
                    <Clock className="h-4 w-4 mr-2" />
                    Réduction des temps d'attente
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Le temps d'attente aux points de transfert représente 35% du
                    délai total. L'implémentation d'un système de rendez-vous
                    pourrait réduire ce temps de moitié.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-amber-800 mt-2"
                    asChild
                  >
                    <Link href="#">
                      Explorer les solutions{" "}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
