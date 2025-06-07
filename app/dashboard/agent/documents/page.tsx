"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import { Search, Filter, Download, Upload, File, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  commandeId: number;
}
interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Commande {
  id: number;
  clientId: number;
  assistantId: number;
  agentId: number;
  nom: string;
  pays: string;
  adresse: string;
  dateDePickup: string | Date;
  dateArrivage: string;
  valeurMarchandise: number;
  typeCommande: string;
  typeTransport: string;
  ecoterme: string;
  modePaiement: string;
  nomDestinataire: string;
  paysDestinataire: string;
  adresseDestinataire: string;
  indicatifTelephoneDestinataire: string;
  telephoneDestinataire: number;
  emailDestinataire: string;
  statut: string;
  adresseActuel: string;
  dateCommande: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  notes: Record<string, string>; // or `{ [key: string]: string }`
  client: Client;
  produits: any[]; // Define a proper Product interface if needed
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { isLoading: authLoading, requireAuth } = useAuthSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[] | null>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // État pour le nouveau document
  const [newDocument, setNewDocument] = useState<{
    nom: string;
    type: string;
    commandeId: number;
    fichier: File | null;
  }>({
    nom: "",
    type: "",
    commandeId: 0,
    fichier: null,
  });
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
  // Fetch commandes data
  useEffect(() => {
    const fetchCommandes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/agent/commandes");

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setCommandes(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          "Une erreur est survenue lors du chargement des commandes. Veuillez réessayer."
        );
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les commandes.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [toast]);
  // Fetch document details
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching Documents");
      const response = await fetch(`/api/agent/documents`, {
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
  }, [isAuthorized, toast]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);
  // Filtrer les documents en fonction des critères
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || document.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const response = await fetch(
        `/api/agent/documents/${newDocument.commandeId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        const newDoc: Document = result;

        // Append the new document to the documents list
        setDocuments((prevDocs) => [...prevDocs, newDoc]);

        // Reset newDocument state
        setNewDocument({
          nom: "",
          type: "",
          commandeId: 0,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gérez vos documents et fichiers
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setIsAddDocumentDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Ajouter un document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des documents</CardTitle>
          <CardDescription>
            Consultez et gérez tous vos documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrer</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Taille</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Date de création
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Commande
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Aucun document trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        {document.id}
                      </TableCell>
                      <TableCell>{document.nom}</TableCell>
                      <TableCell className="hidden md:table-cell uppercase">
                        {document.type}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {document.size}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {document.createdAt}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {document.commandeId}
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Télécharger
                            </span>
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isAddDocumentDialogOpen}
        onOpenChange={setIsAddDocumentDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau document à votre bibliothèque.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du document</Label>
              <Input
                id="nom"
                value={newDocument.nom}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, nom: e.target.value })
                }
                placeholder="Ex: Certificat d'origine, Facture commerciale..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commande">Commande</Label>
              <Select
                value={newDocument.commandeId}
                onValueChange={(value) =>
                  setNewDocument({ ...newDocument, commandeId: value })
                }
              >
                <SelectTrigger id="commande">
                  <SelectValue placeholder="Sélectionner une commande" />
                </SelectTrigger>

                <SelectContent>
                  {commandes.map((commande) => (
                    <SelectItem
                      key={commande.id}
                      value={commande.id.toString()}
                    >
                      Commande #{commande.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Fichier</Label>
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
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => document.getElementById("fichier")?.click()}
                >
                  Parcourir les fichiers
                </Button>
                {newDocument.fichier && (
                  <div className="mt-4 flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {newDocument.fichier.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setNewDocument({ ...newDocument, fichier: null })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
    </div>
  );
}
