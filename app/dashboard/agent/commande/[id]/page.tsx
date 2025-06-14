"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Download,
  FileText,
  Check,
  X,
  Building,
  Truck,
  Calendar,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Upload,
  Send,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";

interface Document {
  id: number;
  idAgent: number;
  nom: string;
  size: number;
  url: string;
  type: string;
  statut: string; // defaults to "À valider"
  createdAt: string; // or Date, depending on how you parse it
  updatedAt: string; // or Date
}

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

// Fonction pour générer un numéro de facture
const generateInvoiceNumber = () => {
  const prefix = "FAC";
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}-${randomNum}`;
};

// Fonction pour générer un ID de document
const generateDocumentId = () => {
  const prefix = "DOC";
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}-${randomNum}`;
};

// Fonction pour calculer le montant HT
const calculateSubtotal = (products) => {
  return products.reduce((total, product) => {
    return total + product.quantite * product.prixUnitaire;
  }, 0);
};

function InputField({ label, id, type = "text", ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} {...props} />
    </div>
  );
}
// Fonction pour calculer la TVA
const calculateTVA = (subtotal, rate) => {
  return subtotal * (rate / 100);
};

// Fonction pour calculer le total TTC
const calculateTotal = (subtotal, tva) => {
  return subtotal + tva;
};

// Fonction pour formater la date au format YYYY-MM-DD
const formatDateForInput = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export default function CommandeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading: authLoading, requireAuth } = useAuthSession();
  const commandeId = params.id as string;
  const [commande, setCommande] = useState<CommandeDetails | null>(null);
  const [documents, setDocuments] = useState<Document[] | null>([]);
  const [status, setStatus] = useState<string>("");

  const statusSteps = [
    { id: "En attente", label: "En attente" },
    { id: "Validée Par Assistant", label: "Validée Par Assistant" },
    { id: "Acceptée", label: "Acceptée" },
    { id: "Expédiée", label: "Expédiée" },
    { id: "Livrée", label: "Livrée" },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.id === status);

  const [isRefuseDialogOpen, setIsRefuseDialogOpen] = useState(false);
  const [isFactureDialogOpen, setIsFactureDialogOpen] = useState(false);
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [isLocationUpdateDialogOpen, setIsLocationUpdateDialogOpen] =
    useState(false);
  const [locationUpdate, setLocationUpdate] = useState({
    title: "",
    address: "",
    description: "",
  });
  const [refuseReason, setRefuseReason] = useState("");
  const [refuseComment, setRefuseComment] = useState("");
  const [refuseDocuments, setRefuseDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationOption, setValidationOption] = useState<
    "valider" | "rejeter" | null
  >(null);
  const [actualAddress, setActualAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  // Check authentication and role
  const checkAuthorization = useCallback(async () => {
    try {
      setIsAuthorized(await requireAuth(["AGENT"]));
    } catch (error) {
      setError("Erreur d'authentification. Veuillez vous reconnecter.");
      console.error("Authentication error:", error);
    }
  }, [requireAuth]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  // Fetch commande details
  const fetchCommandeDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching commande details for id:", commandeId);
      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Fetch response received:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Erreur lors du chargement des détails de la commande"
        );
      }

      const data = await response.json();
      console.log("Commande data received:", data);
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

  // Fetch document details
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching Documents for id:", commandeId);
      const response = await fetch(`/api/agent/documents/${commandeId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Fetch response received:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Erreur lors du chargement des détails de la commande"
        );
      }

      const data = await response.json();
      console.log("Documents data received:", data);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching Documents:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des détails de Documents"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger les détails de Documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, commandeId, toast]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);
  // État pour le nouveau document
  const [newDocument, setNewDocument] = useState<{
    nom: string;
    type: string;
    fichier: File | null;
  }>({
    nom: "",
    type: "",
    fichier: null,
  });

  // État pour le formulaire de facture
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30); // Date d'échéance par défaut à 30 jours

  const [factureData, setFactureData] = useState({
    numeroFacture: generateInvoiceNumber(),
    dateEmission: formatDateForInput(today),
    dateEcheance: formatDateForInput(dueDate),
    adresseFacturationDifferente: false,
    adresseFacturation: commande ? commande.client.adresse : "",
    montantHT: commande
      ? calculateSubtotal(commande.produits).toFixed(2)
      : "0.00",
    tauxTVA: 20,
    montantTVA: commande
      ? calculateTVA(calculateSubtotal(commande.produits), 20).toFixed(2)
      : "0.00",
    montantTTC: commande
      ? calculateTotal(
          calculateSubtotal(commande.produits),
          calculateTVA(calculateSubtotal(commande.produits), 20)
        ).toFixed(2)
      : "0.00",
    messageDescription: "",
    documentsJoints: [],
    sendEmail: true,
  });

  // Calculs pour la facture
  const subtotal = commande ? calculateSubtotal(commande.produits) : 0;
  const tva = calculateTVA(subtotal, factureData.tauxTVA);
  const total = calculateTotal(subtotal, tva);
  // ✅ Handles order validation
  const handleOrderValidation = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "valider",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors de la validation de la commande"
        );
      }

      setStatus("Acceptée");
      toast({
        title: "Commande Acceptée",
        description: `La commande ${commandeId} a été Acceptée avec succès.`,
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
  };
  // ✅ Handles order rejection
  const handleOrderRejection = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rejeter",
          raison: refuseReason,
          commentaire: refuseComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors du rejet de la commande"
        );
      }

      setStatus("Annulée");
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
  };
  // ✅ Handles order rejection
  const handleOrderExp = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStatus",
          status: "Expédiée",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors du rejet de la commande"
        );
      }

      setStatus("Expédiée");
      toast({
        title: "Commande Expédiée",
        description: `La commande ${commandeId} a été Expédiée avec succès.`,
      });
    } catch (error) {
      console.error("Error Expédier order:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de Expédier la commande",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  // ✅ Handles order rejection
  const handleOrderLivraison = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateStatus",
          status: "Livrée",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors du rejet de la commande"
        );
      }

      setStatus("Livrée");
      toast({
        title: "Commande Livrée",
        description: `La commande ${commandeId} a été Livrée avec succès.`,
      });
    } catch (error) {
      console.error("Error Livrer order:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de Livrer la commande",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFacture = async () => {
    try {
      let status = "En Attente";
      if (factureData.sendEmail == false) {
        status = "En attente";
      }
      const response = await fetch(`/api/agent/factures/${commandeId}`, {
        method: "POST",
        body: JSON.stringify({
          clientId: commande?.client.id,
          montant: factureData.montantTTC,
          status: status,
        }),
      });
      const newFacture = await response.json();
      // Update the commande state with the new facture
      setCommande((prev) => ({
        ...prev,
        factures: [...(prev.factures || []), newFacture],
      }));
    } catch (error) {
      console.error("Error creation de Facture:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de Creeer la Facture",
        variant: "destructive",
      });
    } finally {
      setIsFactureDialogOpen(false);
    }
  };

  const handleLocationUpdate = async () => {
    // Ici, vous implémenteriez la logique pour mettre à jour la localisation
    console.log("Mise à jour de localisation:", locationUpdate);
    try {
      setSubmitting(true);
      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateAdress",
          status: locationUpdate.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Erreur lors du changement d'addresse de la commande"
        );
      }
      setActualAddress(locationUpdate.address);
      toast({
        title: "Adress Updated",
        description: `l'adresse actuelle de la commande ${commandeId} a été changée avec succès.`,
      });
    } catch (error) {
      console.error("Error changement d'adresse order:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de changer l'adresse actuelle la commande",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setIsLocationUpdateDialogOpen(false);
      // Réinitialiser le formulaire
      setLocationUpdate({
        title: "",
        address: "",
        description: "",
      });
    }
    //Setter Location
  };

  const handleFactureInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFactureData({
      ...factureData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLocationInputChange = async (e) => {
    const { name, value } = e.target;
    setLocationUpdate({
      ...locationUpdate,
      [name]: value,
    });
    if (name === "address" && value.length > 2) {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            value
          )}&apiKey=a7b26ae96ea24d6a8203efd7d9b4a964`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Erreur de géolocalisation :", error);
        setSuggestions([]);
      }
    } else if (name === "address") {
      setSuggestions([]);
    }
  };

  const handleNewDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "fichier" && files) {
      setNewDocument((prev) => ({
        ...prev,
        fichier: files[0],
      }));
    } else {
      setNewDocument((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddDocument = async () => {
    try {
      const formData = new FormData();
      formData.append("nom", newDocument.nom);
      formData.append("type", newDocument.type);
      if (newDocument.fichier) {
        formData.append("fichier", newDocument.fichier);
      } // Must be a File object

      const response = await fetch(`/api/agent/documents/${commandeId}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const newDoc: Document = result;

        // Append the new document to the documents list
        setDocuments((prevDocs) => [...prevDocs, newDoc]);

        // Reset newDocument state
        setNewDocument({
          nom: "",
          type: "",
          fichier: null,
        });

        setIsAddDocumentDialogOpen(false);
      } else {
        alert(result.error || "Échec de l'ajout du document");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      alert("Une erreur est survenue lors de l'ajout du document.");
    }
  };
  const handleDeleteDocument = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce document ?")) return;

    try {
      const response = await fetch(`/api/agent/documents/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        // Remove from state
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
      } else {
        alert(result.error || "Échec de la suppression du document.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/agent/commandes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {commandeId}
            </h1>
            <StatusBadge
              status={status === "Acceptée" ? "Acceptée" : status}
              className="ml-2"
            />
          </div>
          <p className="text-muted-foreground mt-1">
            {commande ? `${commande.nom} - ${commande.client.nom}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "En attente" ||
            (status === "Validée Par Assistant" && (
              <>
                <Button
                  variant="outline"
                  className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                  onClick={() => setIsRefuseDialogOpen(true)}
                >
                  <X className="h-4 w-4" />
                  Refuser
                </Button>
                <Button
                  className="gap-2 bg-green-500 hover:bg-green-600"
                  onClick={handleOrderValidation}
                >
                  <Check className="h-4 w-4" />
                  Accepter
                </Button>
              </>
            ))}
          {(status === "Expédiée" || status === "Acceptée") && (
            <Button
              variant="outline"
              className="gap-2 mr-auto"
              onClick={() => setIsLocationUpdateDialogOpen(true)}
            >
              <MapPin className="h-4 w-4" />
              Mise à jour localisation
            </Button>
          )}
          {(status === "Acceptée" ||
            status === "Expédiée" ||
            status === "Livrée") &&
            (commande.factures?.some(
              (facture) => facture.document && facture.document !== '""'
            ) ? (
              <a
                href={
                  commande.factures.find(
                    (facture) => facture.document && facture.document !== '""'
                  )?.document
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <FileText className="h-4 w-4" />
                Télécharger ou imprimer Facture
              </a>
            ) : (
              <Button
                className="gap-2 bg-blue-500 hover:bg-blue-600"
                onClick={() => setIsFactureDialogOpen(true)}
              >
                <FileText className="h-4 w-4" />
                Créer une facture
              </Button>
            ))}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5 text-primary" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-lg">
                    {commande ? commande.client.nom : ""}
                  </p>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {commande ? commande.client.adresse : ""}
                  </p>
                  <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="break-all">
                        {commande ? commande.client.email : ""}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {commande ? commande.client.telephone : ""}
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
                    <p className="text-sm text-muted-foreground">
                      Numéro de commande
                    </p>
                    <p className="font-medium">{commandeId}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Date de commande
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {commande ? commande.dateCommande : ""}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Mode de transport
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      {commande ? commande.typeTransport : ""}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Valeur marchandise
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {commande
                        ? commande.valeurMarchandise.toFixed(2)
                        : "0.00"}{" "}
                      €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Suivi de la commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {statusSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index <= currentStepIndex
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < currentStepIndex ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 ${
                          index <= currentStepIndex
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        currentStepIndex === 0
                          ? 0
                          : currentStepIndex === statusSteps.length - 1
                          ? 100
                          : (currentStepIndex / (statusSteps.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 grid-cols-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Adresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium text-base mb-2">
                      Adresse de départ
                    </h3>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {commande ? commande.adresse : ""}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium text-base mb-2">
                      Adresse Actuelle
                    </h3>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {actualAddress ? actualAddress : commande?.adresseActuel}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium text-base mb-2">
                      Adresse de destination
                    </h3>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {commande?.adresseDestinataire}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {status === "Acceptée" && (
            <div className="flex justify-end mt-4">
              <Button
                className="gap-2 bg-blue-500 hover:bg-blue-600"
                onClick={handleOrderExp}
              >
                <Truck className="h-4 w-4" />
                Marquer comme expédiée
              </Button>
            </div>
          )}
          {status === "Expédiée" && (
            <div className="flex justify-end mt-4">
              <Button
                className="gap-2 bg-green-500 hover:bg-green-600"
                onClick={handleOrderLivraison}
              >
                <Check className="h-4 w-4" />
                Marquer comme livrée
              </Button>
            </div>
          )}
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
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">
                        Prix unitaire
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Poids
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Dimensions
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commande
                      ? commande.produits.map((produit) => (
                          <TableRow key={produit.id}>
                            <TableCell className="font-medium">
                              {produit.id}
                            </TableCell>
                            <TableCell>{produit.nom}</TableCell>
                            <TableCell className="text-right">
                              {produit.quantite}
                            </TableCell>
                            <TableCell className="text-right">
                              {produit.tarifUnitaire.toFixed(2)} €
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {produit.poids}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {produit.largeur} x {produit.longueur} x{" "}
                              {produit.hauteur}
                            </TableCell>
                            <TableCell className="text-right">
                              {produit.document?.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    Documents
                                  </span>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents associés</CardTitle>
                <CardDescription>
                  Documents liés à cette commande
                </CardDescription>
              </div>
              <Button
                className="gap-2"
                onClick={() => setIsAddDocumentDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Ajouter un document
              </Button>
            </CardHeader>
            <CardContent>
              {!documents ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    Aucun document associé à cette commande
                  </p>
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => setIsAddDocumentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents?.map((document) => (
                    <div
                      key={document.id}
                      className="p-4 border rounded-lg flex items-start justify-between"
                    >
                      <div>
                        <p className="font-medium">{document.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Télécharger
                            </span>
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRefuseDialogOpen} onOpenChange={setIsRefuseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Refuser la commande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus de cette commande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={refuseReason} onValueChange={setRefuseReason}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem
                  value="documents_incomplets"
                  id="documents_incomplets"
                />
                <Label htmlFor="documents_incomplets" className="font-normal">
                  Documents incomplets ou incorrects
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem
                  value="produits_non_conformes"
                  id="produits_non_conformes"
                />
                <Label htmlFor="produits_non_conformes" className="font-normal">
                  Produits non conformes aux réglementations
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem
                  value="transport_impossible"
                  id="transport_impossible"
                />
                <Label htmlFor="transport_impossible" className="font-normal">
                  Transport impossible vers la destination
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="autre" id="autre" />
                <Label htmlFor="autre" className="font-normal">
                  Autre raison
                </Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
              <Textarea
                id="commentaire"
                placeholder="Ajoutez des détails supplémentaires..."
                value={refuseComment}
                onChange={(e) => setRefuseComment(e.target.value)}
              />
            </div>

            {/* Nouvelle section pour les documents */}
            <div className="space-y-2 pt-2">
              <Label>Documents justificatifs (optionnel)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Joignez des documents justifiant le refus
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Parcourir les fichiers
                </Button>
                {refuseDocuments.length > 0 && (
                  <div className="mt-3 text-left">
                    <p className="text-sm font-medium">
                      Documents sélectionnés:
                    </p>
                    <ul className="text-sm mt-1">
                      {refuseDocuments.map((doc, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="truncate">{doc.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newDocs = [...refuseDocuments];
                              newDocs.splice(index, 1);
                              setRefuseDocuments(newDocs);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefuseDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleOrderRejection}
              disabled={!refuseReason}
            >
              Refuser la commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFactureDialogOpen} onOpenChange={setIsFactureDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Facture</DialogTitle>
            <DialogDescription>
              Détails de facturation pour la commande n°{commandeId}
            </DialogDescription>
          </DialogHeader>

          {/* Informations client */}
          <section className="space-y-4 py-1 ">
            <h3 className="text-lg font-semibold">Client</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p>
                <strong>Nom :</strong> {commande?.client.nom}
              </p>
              <p>
                <strong>Email :</strong> {commande?.client.email}
              </p>
              <p>
                <strong>Téléphone :</strong> {commande?.client.telephone}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="adresseFacturationDifferente"
                checked={factureData.adresseFacturationDifferente}
                onCheckedChange={(checked) =>
                  setFactureData({
                    ...factureData,
                    adresseFacturationDifferente: checked,
                  })
                }
              />
              <Label htmlFor="adresseFacturationDifferente">
                Adresse de facturation différente
              </Label>
            </div>

            {factureData.adresseFacturationDifferente && (
              <div className="space-y-2">
                <Label htmlFor="adresseFacturation">Adresse</Label>
                <Textarea
                  id="adresseFacturation"
                  value={factureData.adresseFacturation}
                  onChange={handleFactureInputChange}
                  placeholder="Saisissez l'adresse de facturation"
                  rows={2}
                />
              </div>
            )}
          </section>

          {/* Détails facture */}
          <section className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Facture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Numéro de facture"
                id="numeroFacture"
                value={factureData.numeroFacture}
                onChange={handleFactureInputChange}
              />
              <InputField
                label="Date d'émission"
                id="dateEmission"
                type="date"
                value={factureData.dateEmission}
                onChange={handleFactureInputChange}
              />
            </div>
          </section>

          {/* Montants */}
          <section className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Montants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Montant HT (€)"
                id="montantHT"
                type="number"
                step="0.01"
                value={factureData.montantHT}
                onChange={handleFactureInputChange}
              />

              <InputField
                label="Taux de TVA (%)"
                id="tauxTVA"
                type="number"
                step="0.01"
                value={factureData.tauxTVA}
                onChange={(e) => {
                  const taux = parseFloat(e.target.value);
                  const ht = parseFloat(factureData.montantHT);
                  const tva = ((ht * taux) / 100).toFixed(2);
                  const ttc = (ht + parseFloat(tva)).toFixed(2);
                  setFactureData({
                    ...factureData,
                    tauxTVA: taux,
                    montantTVA: tva,
                    montantTTC: ttc,
                  });
                }}
              />

              <InputField
                label="TVA (€)"
                id="montantTVA"
                type="number"
                step="0.01"
                value={factureData.montantTVA}
                readOnly
              />
              <InputField
                label="Total TTC (€)"
                id="montantTTC"
                type="number"
                step="0.01"
                value={factureData.montantTTC}
                readOnly
              />
            </div>
          </section>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsFactureDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateFacture}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
            >
              {factureData.sendEmail ? (
                <>
                  <Send className="h-4 w-4" /> Envoyer
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" /> Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour ajouter un document */}
      <Dialog
        open={isAddDocumentDialogOpen}
        onOpenChange={setIsAddDocumentDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau document à cette commande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du document</Label>
              <Input
                id="nom"
                name="nom"
                value={newDocument.nom}
                onChange={handleNewDocumentChange}
                placeholder="Ex: Facture commerciale, Certificat d'origine..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de document</Label>
              <Select
                value={newDocument.type}
                onValueChange={(value) =>
                  setNewDocument({ ...newDocument, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">DOC/DOCX</SelectItem>
                  <SelectItem value="xls">XLS/XLSX</SelectItem>
                  <SelectItem value="jpg">JPG/JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fichier">Fichier</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Glissez-déposez un fichier ici ou cliquez pour parcourir
                </p>
                <Input
                  id="fichier"
                  name="fichier"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleNewDocumentChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => document.getElementById("fichier").click()}
                >
                  Parcourir les fichiers
                </Button>
                {newDocument.fichier && (
                  <p className="mt-2 text-sm font-medium">
                    Fichier sélectionné: {newDocument.fichier.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDocumentDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={!newDocument.nom || !newDocument.fichier}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour la mise à jour de localisation */}
      <Dialog
        open={isLocationUpdateDialogOpen}
        onOpenChange={setIsLocationUpdateDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mise à jour de localisation</DialogTitle>
            <DialogDescription>
              Mettez à jour la localisation actuelle de cette commande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la mise à jour</Label>
              <Input
                id="title"
                name="title"
                value={locationUpdate.title}
                onChange={handleLocationInputChange}
                placeholder="Ex: Arrivée à l'entrepôt de Paris"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="address">Adresse de localisation actuelle</Label>
              <Input
                id="address"
                name="address"
                value={locationUpdate.address}
                onChange={handleLocationInputChange}
                placeholder="Adresse complète où se trouve actuellement la commande"
                autoComplete="off"
              />
              {locationUpdate.address && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setLocationUpdate({
                          ...locationUpdate,
                          address: suggestion.properties.formatted,
                        });
                        setSuggestions([]);
                      }}
                    >
                      {suggestion.properties.formatted}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                name="description"
                value={locationUpdate.description}
                onChange={handleLocationInputChange}
                placeholder="Informations supplémentaires sur la localisation ou l'état de la commande..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLocationUpdateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleLocationUpdate}
              disabled={!locationUpdate.title || !locationUpdate.address}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Mettre à jour la localisation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
