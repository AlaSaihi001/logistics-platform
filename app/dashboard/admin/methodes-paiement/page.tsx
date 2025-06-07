"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

// Type definitions
interface PaymentMethod {
  id: string;
  nom: string;
  description: string;
  frais: string;
  fraisFixe: string;
  statut: "actif" | "inactif";
  dateCreation: string;
  derniereMaj: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState({
    nom: "",
    description: "",
    frais: "",
    fraisFixe: "",
    statut: "actif",
  });

  // Fetch payment methods from the backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/payment-methods");

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des méthodes de paiement: ${response.status}`
          );
        }

        const data = await response.json();
        setMethods(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        toast({
          variant: "destructive",
          title: "Erreur",
          description:
            "Impossible de charger les méthodes de paiement. Veuillez réessayer.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleAddMethod = async () => {
    try {
      const response = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMethod),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'ajout: ${response.status}`);
      }

      const addedMethod = await response.json();

      // Update local state
      setMethods([...methods, addedMethod]);

      setNewMethod({
        nom: "",
        description: "",
        frais: "",
        fraisFixe: "",
        statut: "actif",
      });

      setIsAddDialogOpen(false);

      toast({
        title: "Méthode ajoutée",
        description: "La méthode de paiement a été ajoutée avec succès.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Impossible d'ajouter la méthode de paiement. Veuillez réessayer.",
      });
    }
  };

  const handleEditMethod = async () => {
    if (!currentMethod) return;

    try {
      const response = await fetch(
        `/api/admin/payment-methods/${currentMethod.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: currentMethod.nom,
            description: currentMethod.description,
            frais: currentMethod.frais,
            fraisFixe: currentMethod.fraisFixe,
            statut: currentMethod.statut,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      const updatedMethod = await response.json();

      // Update local state
      setMethods(
        methods.map((method) =>
          method.id === currentMethod.id ? updatedMethod : method
        )
      );

      setIsEditDialogOpen(false);

      toast({
        title: "Méthode mise à jour",
        description: "La méthode de paiement a été mise à jour avec succès.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Impossible de mettre à jour la méthode de paiement. Veuillez réessayer.",
      });
    }
  };

  const handleDeleteMethod = async () => {
    if (!currentMethod) return;

    try {
      const response = await fetch(
        `/api/admin/payment-methods/${currentMethod.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.status}`);
      }

      // Update local state
      setMethods(methods.filter((method) => method.id !== currentMethod.id));

      setIsDeleteDialogOpen(false);

      toast({
        title: "Méthode supprimée",
        description: "La méthode de paiement a été supprimée avec succès.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Impossible de supprimer la méthode de paiement. Veuillez réessayer.",
      });
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "actif" | "inactif"
  ) => {
    try {
      const newStatus = currentStatus === "actif" ? "inactif" : "actif";
      console.log("Status", newStatus);
      const response = await fetch(`/api/admin/payment-methods/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la mise à jour du statut: ${response.status}`
        );
      }

      // Update local state
      setMethods(
        methods.map((method) =>
          method.id === id ? { ...method, statut: newStatus } : method
        )
      );

      toast({
        title: "Statut mis à jour",
        description: `La méthode de paiement a été ${
          newStatus === "actif" ? "activée" : "désactivée"
        } avec succès.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Impossible de mettre à jour le statut. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Méthodes de Paiement
          </h1>
          <p className="text-muted-foreground">
            Gérez les méthodes de paiement disponibles sur la plateforme
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>Ajouter une méthode</span>
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Les modifications des méthodes de paiement peuvent affecter les
          transactions en cours. Assurez-vous de vérifier les impacts avant de
          désactiver une méthode.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des méthodes de paiement</CardTitle>
          <CardDescription>
            Consultez et gérez toutes les méthodes de paiement disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Frais</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Frais fixe
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Date de création
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Dernière mise à jour
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Chargement des méthodes de paiement...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : methods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
                      Aucune méthode de paiement trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {method.nom}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {method.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Percent className="h-3 w-3 mr-1 text-muted-foreground" />
                          {method.frais}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                          {method.fraisFixe}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {method.dateCreation}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {method.derniereMaj}
                      </TableCell>
                      <TableCell>
                        {method.statut === "actif" ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" /> Actif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentMethod(method);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(method.id, method.statut)
                              }
                            >
                              {method.statut === "actif" ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setCurrentMethod(method);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'ajout de méthode de paiement */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une méthode de paiement</DialogTitle>
            <DialogDescription>
              Créez une nouvelle méthode de paiement pour la plateforme.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom
              </Label>
              <Input
                id="nom"
                value={newMethod.nom}
                onChange={(e) =>
                  setNewMethod({ ...newMethod, nom: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newMethod.description}
                onChange={(e) =>
                  setNewMethod({ ...newMethod, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frais" className="text-right">
                Frais (%)
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="frais"
                  value={newMethod.frais}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, frais: e.target.value })
                  }
                  className="w-full"
                />
                <Percent className="h-4 w-4 ml-2 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fraisFixe" className="text-right">
                Frais fixe (€)
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="fraisFixe"
                  value={newMethod.fraisFixe}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, fraisFixe: e.target.value })
                  }
                  className="w-full"
                />
                <DollarSign className="h-4 w-4 ml-2 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statut" className="text-right">
                Actif
              </Label>
              <Switch
                id="statut"
                checked={newMethod.statut === "actif"}
                onCheckedChange={(checked) =>
                  setNewMethod({
                    ...newMethod,
                    statut: checked ? "actif" : "inactif",
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddMethod}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification de méthode de paiement */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la méthode de paiement</DialogTitle>
            <DialogDescription>
              Modifiez les détails de la méthode de paiement.
            </DialogDescription>
          </DialogHeader>
          {currentMethod && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nom" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-nom"
                  value={currentMethod.nom}
                  onChange={(e) =>
                    setCurrentMethod({ ...currentMethod, nom: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={currentMethod.description}
                  onChange={(e) =>
                    setCurrentMethod({
                      ...currentMethod,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-frais" className="text-right">
                  Frais (%)
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    id="edit-frais"
                    value={currentMethod.frais}
                    onChange={(e) =>
                      setCurrentMethod({
                        ...currentMethod,
                        frais: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                  <Percent className="h-4 w-4 ml-2 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-fraisFixe" className="text-right">
                  Frais fixe (€)
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    id="edit-fraisFixe"
                    value={currentMethod.fraisFixe}
                    onChange={(e) =>
                      setCurrentMethod({
                        ...currentMethod,
                        fraisFixe: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                  <DollarSign className="h-4 w-4 ml-2 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-statut" className="text-right">
                  Actif
                </Label>
                <Switch
                  id="edit-statut"
                  checked={currentMethod.statut === "actif"}
                  onCheckedChange={(checked) =>
                    setCurrentMethod({
                      ...currentMethod,
                      statut: checked ? "actif" : "inactif",
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleEditMethod}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression de méthode de paiement */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supprimer la méthode de paiement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {currentMethod && (
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  La suppression de la méthode de paiement "{currentMethod.nom}"
                  peut affecter les transactions en cours et les statistiques
                  historiques.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteMethod}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
