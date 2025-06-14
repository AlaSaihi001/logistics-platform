"use client";

import { useState, useEffect } from "react";
import {
  Package,
  FileText,
  Receipt,
  Clock,
  PackageCheck,
  AlertTriangle,
  ChevronRight,
  Download,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
// Types for our data
interface Expedition {
  id: string;
  nom: string;
  client: {
    nom: string;
    id: string;
    adresse: string;
    email: string;
    telephone: string;
  };
  paysOrigine: string;
  adresseExpedition: string;
  datePickup: string;
  valeurMarchandise: number;
  typeCommande: string;
  typeTransport: string;
  incotermes: string;
  modePaiement: string;
  destinataire: {
    adresse: string;
    pays: string;
    telephone: string;
    email: string;
  };
  adresseActuelle: string;
  status: string;
  dateCreation: string;
  dateDerniereModification: string;
  agentAssigne: any;
  commentaires: any[];
  historique: {
    date: string;
    action: string;
    utilisateur: string;
  }[];
  produits: {
    id: string;
    image: string;
    nom: string;
    categorie: string;
    tarifUnitaire: number;
    poids: number;
    largeur: number;
    longeur: number;
    quantite: number;
    conditionnement: string;
    fragile: boolean;
    description: string;
    document: string;
  }[];
}

interface Document {
  id: number;
  idAgent: number;
  commandeId: number;
  nom: string;
  size: number;
  url: string;
  type: string;
  statut: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  indicatifPaysTelephone: string;
  telephone: number;
  motDePasse: string;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
export interface Facture {
  id: number;
  idCommande: number;
  idClient: number;
  idAgent: number;
  document: string;
  numeroFacture: number;
  montant: number;
  dateEmission: string;
  status: string;
  assistantId: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  commande: Expedition;
}
interface DashboardStats {
  expeditionsEnCours: number;
  documentsAValider: number;
  facturesAEnvoyer: number;
  expeditionsUrgentes: number;
}

export default function AgentDashboardPage() {
  const [activeTab, setActiveTab] = useState("apercu");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for our data
  const [stats, setStats] = useState<DashboardStats>({
    expeditionsEnCours: 0,
    documentsAValider: 0,
    facturesAEnvoyer: 0,
    expeditionsUrgentes: 0,
  });
  const [urgentExpeditions, setUrgentExpeditions] = useState<Expedition[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [recentExpeditions, setRecentExpeditions] = useState<Expedition[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [histoData, setHistoData] = useState<Record<string, number>>({});
  const [pieData, setPieData] = useState<{ statut: string; count: number }[]>(
    []
  );

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

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
        });

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const statsData = await statsResponse.json();
        console.log(statsData);
        setStats(statsData);

        // Fetch urgent expeditions
        const urgentResponse = await fetch(
          "/api/agent/dashboard/urgent-expeditions"
        );
        if (!urgentResponse.ok) {
          throw new Error("Failed to fetch urgent expeditions");
        }

        const urgentData = await urgentResponse.json();
        setUrgentExpeditions(urgentData);

        // Fetch pending documents
        const documentsResponse = await fetch(
          "/api/agent/dashboard/pending-documents"
        );
        if (!documentsResponse.ok) {
          throw new Error("Failed to fetch pending documents");
        }

        const documentsData = await documentsResponse.json();
        setPendingDocuments(documentsData);

        // Fetch recent expeditions
        const recentResponse = await fetch(
          "/api/agent/dashboard/recent-expeditions"
        );
        if (!recentResponse.ok) {
          throw new Error("Failed to fetch recent expeditions");
        }

        const recentData = await recentResponse.json();
        setRecentExpeditions(recentData);
        const facturesResponse = await fetch("/api/agent/factures");
        const facturesData = await facturesResponse.json();
        setFactures(facturesData);
        if (!recentResponse.ok) {
          throw new Error("Failed to fetch recent expeditions");
        }
        const response = await fetch("/api/agent/dashboard/quick-stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setHistoData(data.HistoData);
        setPieData(data.PieData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Une erreur est survenue lors du chargement des données. Veuillez réessayer."
        );
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les données du tableau de bord.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange, toast]);

  const histoChartData = Object.entries(histoData).map(([month, count]) => ({
    name: month,
    Expéditions: count,
  }));
  const pieChartData = pieData.map((item) => ({
    name: item.statut,
    value: item.count,
  }));
  // Fallback data for development/demo purposes
  const fallbackUrgentExpeditions = [
    {
      id: "EXP-2023-089",
      client: "TechGlobal",
      date: "15/03/2023",
      status: "en-cours",
    },
    {
      id: "EXP-2023-092",
      client: "MediPharma",
      date: "18/03/2023",
      status: "en-cours",
    },
    {
      id: "EXP-2023-095",
      client: "FoodExpress",
      date: "20/03/2023",
      status: "en-cours",
    },
  ];

  const fallbackPendingDocuments = [
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
  ];

  const COLORS = ["#0ea5e9", "#f97316", "#22c55e"]; // blue, orange, green
  const fallbackRecentExpeditions = [
    {
      id: "EXP-2023-089",
      client: "TechGlobal",
      date: "15/03/2023",
      status: "en-cours",
    },
    {
      id: "EXP-2023-088",
      client: "FashionRetail",
      date: "14/03/2023",
      status: "expedie",
    },
    {
      id: "EXP-2023-087",
      client: "AutoParts",
      date: "12/03/2023",
      status: "livre",
    },
    {
      id: "EXP-2023-086",
      client: "HomeDecor",
      date: "10/03/2023",
      status: "annule",
    },
  ];

  // Use fallback data if loading or error
  const displayUrgentExpeditions =
    isLoading || error ? fallbackUrgentExpeditions : urgentExpeditions;
  const displayPendingDocuments =
    isLoading || error ? fallbackPendingDocuments : pendingDocuments;
  const displayRecentExpeditions =
    isLoading || error ? fallbackRecentExpeditions : recentExpeditions;

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
  };

  // Use fallback stats if loading or error
  const displayStats = isLoading || error ? fallbackStats : stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#074e6e]">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre tableau de bord, Agent Logistique
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs
        defaultValue="apercu"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-auto bg-[#074e6e]/10">
            <TabsTrigger
              value="apercu"
              className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white"
            >
              Aperçu
            </TabsTrigger>
            <TabsTrigger
              value="expeditions"
              className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white"
            >
              Expéditions
            </TabsTrigger>
            
            <TabsTrigger
              value="factures"
              className="data-[state=active]:bg-[#074e6e] data-[state=active]:text-white"
            >
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
              isLoading={isLoading}
            />
            <StatsCard
              title="Documents à valider"
              value={displayStats.documentsAValider.toString()}
              icon={FileText}
              isLoading={isLoading}
            />
            <StatsCard
              title="Factures à envoyer"
              value={displayStats.facturesAEnvoyer.toString()}
              icon={Receipt}
              isLoading={isLoading}
            />
            <StatsCard
              title="Commandes livrées"
              value={displayStats.expeditionsUrgentes.toString()}
              icon={PackageCheck}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-none shadow-md">
              <CardHeader className="border-b border-[#074e6e]/10">
                <CardTitle className="text-[#074e6e]">
                  Expéditions par mois
                </CardTitle>
                <CardDescription>
                  Nombre d'expéditions traitées par mois
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] flex items-center justify-center bg-[#074e6e]/5 rounded-md">
                  {isLoading ? (
                    <div className="animate-pulse flex flex-col items-center justify-center">
                      <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 w-48 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={histoChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Expéditions" fill="#074e6e" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-none shadow-md">
              <CardHeader className="border-b border-[#074e6e]/10">
                <CardTitle className="text-[#074e6e]">
                  État des factures
                </CardTitle>
                <CardDescription>
                  Répartition des factures par statut
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] flex items-center justify-center bg-[#074e6e]/5 rounded-md">
                  {isLoading ? (
                    <div className="animate-pulse flex flex-col items-center justify-center">
                      <div className="h-32 w-32 bg-gray-300 rounded-full mb-4"></div>
                      <div className="h-4 w-48 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#074e6e]/10">
                <CardTitle className="text-lg font-medium text-[#074e6e]">
                  Expédition En Cours
                </CardTitle>
                <Clock className="h-4 w-4 text-[#074e6e]" />
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center justify-between p-2"
                      >
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
                          <p className="text-sm text-muted-foreground">
                            {expedition.client.nom} {expedition.client.prenom}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={expedition.statut as any} />
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-[#074e6e]/10 hover:text-[#074e6e]"
                          >
                            <Link
                              href={`/dashboard/agent/commande/${expedition.id}`}
                            >
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
                  <Link href="/dashboard/agent/commandes">
                    Voir toutes les expéditions
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#074e6e]/10">
                <CardTitle className="text-lg font-medium text-[#074e6e]">
                  Documents en attente
                </CardTitle>
                <FileText className="h-4 w-4 text-[#074e6e]" />
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center justify-between p-2"
                      >
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
                          <p className="text-sm text-muted-foreground">
                            {document.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={document.statut as any} />
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-[#074e6e]/10 hover:text-[#074e6e]"
                          >
                            <a href={document.url} download>
                              <Download className="h-4 w-4" />
                            </a>
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
                  <Link href="/dashboard/agent/documents">
                    Voir tous les documents
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expeditions" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-[#074e6e]/10">
              <CardTitle className="text-[#074e6e]">
                Expéditions récentes
              </CardTitle>
              <CardDescription>
                Liste des dernières expéditions traitées
              </CardDescription>
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
                          <TableRow
                            key={index}
                            className="border-b border-[#074e6e]/10"
                          >
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
                        <TableRow
                          key={expedition.id}
                          className="border-b border-[#074e6e]/10 hover:bg-[#074e6e]/5"
                        >
                          <TableCell className="font-medium">
                            {expedition.id}
                          </TableCell>
                          <TableCell>
                            {expedition.client.nom} {expedition.client.prenom}
                          </TableCell>
                          <TableCell>{expedition.dateCommande}</TableCell>
                          <TableCell>
                            <StatusBadge status={expedition.statut as any} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                            >
                              <Link
                                href={`/dashboard/agent/commande/${expedition.id}`}
                              >
                                Détails
                              </Link>
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
                <Link href="/dashboard/agent/commandes">
                  Voir toutes les expéditions
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-[#074e6e]/10">
              <CardTitle className="text-[#074e6e]">
                Documents à valider
              </CardTitle>
              <CardDescription>
                Documents en attente de validation
              </CardDescription>
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
                          <TableRow
                            key={index}
                            className="border-b border-[#074e6e]/10"
                          >
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
                    : displayPendingDocuments.map((document) => (
                        <TableRow
                          key={document.id}
                          className="border-b border-[#074e6e]/10 hover:bg-[#074e6e]/5"
                        >
                          <TableCell className="font-medium">
                            {document.id}
                          </TableCell>
                          <TableCell>{document.type}</TableCell>
                          <TableCell>{document.createdAt}</TableCell>
                          <TableCell>
                            <StatusBadge status={document.statut as any} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-[#074e6e]/10 hover:text-[#074e6e] border-[#074e6e]/20"
                            >
                              <Link href={`/dashboard/agent/documents`}>
                                Détails
                              </Link>
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
                <Link href="/dashboard/agent/documents">
                  Voir tous les documents
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="factures" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-[#074e6e]/10">
              <CardTitle className="text-[#074e6e]">
                Factures récentes
              </CardTitle>
              <CardDescription>
                Liste des dernières factures émises
              </CardDescription>
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
                          <TableRow
                            key={index}
                            className="border-b border-[#074e6e]/10"
                          >
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
                    : factures.map((facture) => (
                        <TableRow
                          key={facture.id}
                          className="border-b border-[#074e6e]/10 hover:bg-[#074e6e]/5"
                        >
                          <TableCell className="font-medium">
                            {facture.id}
                          </TableCell>
                          <TableCell>{facture.client.nom}</TableCell>
                          <TableCell>{facture.montant}</TableCell>
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
                              <Link
                                href={`/dashboard/agent/factures/${facture.id}`}
                              >
                                Détails
                              </Link>
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
                <Link href="/dashboard/agent/factures">
                  Voir toutes les factures
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
