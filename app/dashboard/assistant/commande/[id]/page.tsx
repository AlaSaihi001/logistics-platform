"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Globe,
  Mail,
  Phone,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import { Input } from "@/components/ui/input";

interface CommandeDetails {
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
  adresseActuel: string;
  status: string;
  dateCreation: string;
  dateDerniereModification: string;
  agentAssigne: any;
  commentaires: any[];

  produits: {
    id: string;
    image: string;
    nom: string;
    categorie: string;
    tarifUnitaire: number;
    poids: number;
    dimensions: string;
    quantite: number;
    conditionnement: string;
    fragile: boolean;
    description: string;
    document: string;
  }[];
}

export default function CommandeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading: authLoading, requireAuth } = useAuthSession();
  const commandeId = params.id as string;

  const [commande, setCommande] = useState<CommandeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // For validation form
  const [status, setStatus] = useState<string>("");
  const [validationOption, setValidationOption] = useState<
    "valider" | "rejeter" | null
  >(null);
  const [rejetRaison, setRejetRaison] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [pays, setPays] = useState("");
  const [etat, setEtat] = useState("");
  const [agents, setAgents] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // States to manage selected agent and address
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);
  // Check authentication and role
  const checkAuthorization = useCallback(async () => {
    try {
      setIsAuthorized(await requireAuth(["ASSISTANT"]));
    } catch (error) {
      setError("Erreur d'authentification. Veuillez vous reconnecter.");
      console.error("Authentication error:", error);
    }
  }, [requireAuth]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  // Fetch commande details
  const fetchAgents = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/assistant/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors du chargement des détails des agents"
        );
      }

      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des détails des agents"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger les détails de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, toast]);
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  // Fetch commande details
  const fetchCommandeDetails = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/assistant/commandes/${commandeId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Erreur lors du chargement des détails de la commande"
        );
      }

      const data = await response.json();
      setCommande(data);
      setStatus(data.statut);
    } catch (error) {
      console.error("Error fetching commande details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des détails de la commande"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger les détails de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, commandeId, toast]);

  useEffect(() => {
    fetchCommandeDetails();
  }, [fetchCommandeDetails]);

  // Handle validation
  const handleValidation = async () => {
    if (validationOption === "valider") {
      try {
        setSubmitting(true);

        const response = await fetch(`/api/assistant/commandes/${commandeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "valider",
            agentId: selectedAgentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Erreur lors de la validation de la commande"
          );
        }

        setStatus("Validée par l'assistant"); // or whatever you use
        toast({
          title: "Commande validée",
          description: `La commande ${commandeId} a été validée avec succès.`,
        });
      } catch (error) {
        console.error("Error validating order:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de valider la commande",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    } else if (validationOption === "rejeter") {
      try {
        setSubmitting(true);

        const response = await fetch(`/api/assistant/commandes/${commandeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "rejeter",
            raison: rejetRaison,
            commentaire: commentaire,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Erreur lors du rejet de la commande"
          );
        }

        setStatus("Rejetée");
        toast({
          title: "Commande rejetée",
          description: `La commande ${commandeId} a été rejetée avec succès.`,
        });
      } catch (error) {
        console.error("Error rejecting order:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de rejeter la commande",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Fonction pour déterminer quels onglets afficher en fonction du statut
  const getAvailableTabs = () => {
    const tabs = [
      { id: "informations", label: "Informations générales" },
      { id: "produits", label: "Produits" },
    ];

    // Ajouter l'onglet validation uniquement pour les commandes en attente
    if (status === "En attente") {
      tabs.push({ id: "validation", label: "Validation" });
    }

    return tabs;
  };

  // Obtenir les onglets disponibles
  const availableTabs = getAvailableTabs();

  // Déterminer l'icône et la couleur en fonction du statut
  const getStatusInfo = () => {
    switch (status) {
      case "En attente":
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          color: "bg-amber-50 border-amber-200 text-amber-700",
        };
      case "Validée par l'assistant":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: "bg-green-50 border-green-200 text-green-700",
        };
      case "Rejetée":
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          color: "bg-red-50 border-red-200 text-red-700",
        };
      case "Expédiée":
        return {
          icon: <Truck className="h-5 w-5 text-blue-500" />,
          color: "bg-blue-50 border-blue-200 text-blue-700",
        };
      case "Livrée":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: "bg-green-50 border-green-200 text-green-700",
        };
      case "Annulée":
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          color: "bg-red-50 border-red-200 text-red-700",
        };
      case "Archivée":
        return {
          icon: <Archive className="h-5 w-5 text-gray-500" />,
          color: "bg-gray-50 border-gray-200 text-gray-700",
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-500" />,
          color: "bg-blue-50 border-blue-200 text-blue-700",
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Refresh data
  const refreshData = () => {
    fetchCommandeDetails();
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
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
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Erreur
          </h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="w-fit"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Commande non trouvée
          </h1>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            La commande demandée n'a pas été trouvée. Elle a peut-être été
            supprimée ou déplacée.
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/assistant/commandes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {commandeId}
            </h1>
            <StatusBadge status={status as any} className="ml-2" />
          </div>
          <p className="text-muted-foreground mt-1">
            {commande.nom} - {commande.client.nom}
          </p>
        </div>

        {/* Boutons d'action qui varient selon le statut */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alerte d'information qui varie selon le statut */}
      <Alert className={`border ${statusInfo.color}`}>
        {statusInfo.icon}
        <AlertTitle>
          {status === "En attente" && "Commande en attente de validation"}
          {status === "Validée par l'assistant" && "Commande validée"}
          {status === "Acceptée" && "Commande Acceptée"}
          {status === "Expédiée" && "Commande en cours d'expédition"}
          {status === "livree" && "Commande livrée"}
          {status === "annulee" && "Commande annulée"}
          {status === "archivee" && "Commande archivée"}
        </AlertTitle>
        <AlertDescription>
          {status === "En attente" &&
            "Cette commande nécessite votre validation. Veuillez vérifier les informations et prendre une décision."}
          {status === "Validée par l'assistant" &&
            "Cette commande a été validée et assignée à un agent logistique."}
          {status === "Acceptée" &&
            "Cette commande a été Acceptée. Attendez l'expédition de cette commande."}
          {status === "Expédiée" &&
            "Cette commande est en cours d'acheminement vers sa destination."}
          {status === "livrée" &&
            "Cette commande a été livrée avec succès à son destinataire."}
          {status === "Annulee" &&
            "Cette commande a été annulée par le client ou l'administrateur."}
          {status === "Archivée" &&
            "Cette commande a été archivée et n'est plus active."}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={availableTabs[0].id} className="space-y-4">
        <TabsList>
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="informations" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-lg">{commande.client.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    ID Client: {commande.client.id}
                  </p>
                  <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="break-all">{commande.client.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {commande.client.telephone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Détails de la commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">ID Commande</p>
                    <p className="font-medium">{commandeId}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Nom commande
                    </p>
                    <p className="font-medium">{commande.nom}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Type commande
                    </p>
                    <p className="font-medium capitalize">
                      {commande.typeCommande}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Type transport
                    </p>
                    <p className="font-medium capitalize">
                      {commande.typeTransport}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Incotermes</p>
                    <p className="font-medium">{commande.incotermes}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Mode paiement
                    </p>
                    <p className="font-medium">{commande.modePaiement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Informations d'expédition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Pays d'origine
                  </p>
                  <p className="font-medium">{commande.pays}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Adresse d'expédition
                  </p>
                  <p className="font-medium break-words">{commande.adresse}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Date de pickup
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {commande.dateDePickup}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Valeur marchandise
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {commande.valeurMarchandise.toFixed(2)} €
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Adresse actuelle
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    {commande.adresseActuel}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" />
                  Informations destinataire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Adresse destinataire
                  </p>
                  <p className="font-medium break-words">
                    {commande.adresseDestinataire}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Pays destinataire
                  </p>
                  <p className="font-medium">{commande.paysDestinataire}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Téléphone destinataire
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {commande.telephoneDestinataire}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Email destinataire
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {commande.emailDestinataire}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="produits">
          <Card>
            <CardHeader>
              <CardTitle>Liste des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">ID Produit</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">
                        Tarif unitaire
                      </TableHead>
                      <TableHead className="text-right">Poids (kg)</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead>Conditionnement</TableHead>
                      <TableHead>Fragile</TableHead>
                      <TableHead className="text-right">Document</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commande.produits.map((produit) => (
                      <TableRow key={produit.id}>
                        <TableCell className="font-medium">
                          {produit.id}
                        </TableCell>
                        <TableCell>{produit.nom}</TableCell>
                        <TableCell>{produit.categorie}</TableCell>
                        <TableCell className="text-right">
                          {produit.tarifUnitaire.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          {produit.poids}
                        </TableCell>
                        <TableCell>{produit.dimensions}</TableCell>
                        <TableCell className="text-right">
                          {produit.quantite}
                        </TableCell>
                        <TableCell>{produit.conditionnement}</TableCell>
                        <TableCell>{produit.fragile ? "Oui" : "Non"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Télécharger
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between">
                  <span>Nombre total de produits</span>
                  <span>{commande.produits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantité totale d'articles</span>
                  <span>
                    {commande.produits.reduce(
                      (acc, prod) => acc + prod.quantite,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Poids total</span>
                  <span>
                    {commande.produits
                      .reduce(
                        (acc, prod) => acc + prod.poids * prod.quantite,
                        0
                      )
                      .toFixed(2)}{" "}
                    kg
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                  <span>Valeur totale</span>
                  <span>
                    {commande.produits
                      .reduce(
                        (acc, prod) => acc + prod.tarifUnitaire * prod.quantite,
                        0
                      )
                      .toFixed(2)}{" "}
                    €
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {status === "En attente" && (
          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle>Validation de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <Info className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                    <p className="text-amber-700">
                      Cette commande est en attente de validation. Veuillez
                      vérifier toutes les informations avant de valider ou
                      rejeter.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Action</h3>
                      <RadioGroup
                        value={validationOption || ""}
                        onValueChange={(value) =>
                          setValidationOption(value as any)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="valider" id="valider" />
                          <Label htmlFor="valider" className="font-medium">
                            Valider la commande
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <RadioGroupItem value="rejeter" id="rejeter" />
                          <Label htmlFor="rejeter" className="font-medium">
                            Rejeter la commande
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {validationOption === "valider" && (
                      <div className="space-y-4 p-4 rounded-lg border border-green-200 bg-green-50">
                        <div>
                          <Label htmlFor="agent" className="text-green-700">
                            Sélectionnez un agent
                          </Label>
                          <Select
                            value={selectedAgentId}
                            onValueChange={(id) => setSelectedAgentId(id)}
                          >
                            <SelectTrigger
                              id="agent"
                              className="mt-1 border-green-200"
                            >
                              <SelectValue placeholder="Choisissez un agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.nom}
                                  {""}
                                  {agent.prenom} - {agent.adresse}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    {validationOption === "rejeter" && (
                      <div className="space-y-4 p-4 rounded-lg border border-red-200 bg-red-50">
                        <div>
                          <Label
                            htmlFor="rejet-raison"
                            className="text-red-700"
                          >
                            Motif du rejet
                          </Label>
                          <Select
                            value={rejetRaison}
                            onValueChange={setRejetRaison}
                          >
                            <SelectTrigger
                              id="rejet-raison"
                              className="mt-1 border-red-200"
                            >
                              <SelectValue placeholder="Sélectionnez un motif" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document-incomplet">
                                Document incomplet
                              </SelectItem>
                              <SelectItem value="informations-incorrectes">
                                Informations incorrectes
                              </SelectItem>
                              <SelectItem value="format-non-conforme">
                                Format non conforme
                              </SelectItem>
                              <SelectItem value="autre">
                                Autre raison
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="commentaire" className="text-red-700">
                            Commentaire (optionnel)
                          </Label>
                          <Textarea
                            id="commentaire"
                            placeholder="Précisez la raison du rejet..."
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            className="mt-1 border-red-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setValidationOption(null);
                    setRejetRaison("");
                    setCommentaire("");
                  }}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleValidation}
                  disabled={!validationOption || submitting}
                  className={
                    validationOption === "valider"
                      ? "bg-green-600 hover:bg-green-700"
                      : validationOption === "rejeter"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    "Valider"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
