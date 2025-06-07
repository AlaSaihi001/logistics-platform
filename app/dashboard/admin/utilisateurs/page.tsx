"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  User,
  Truck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Phone,
  Headphones,
  CreditCard,
  FileText,
  Package,
  Users,
  UserCog,
  Headset,
  Briefcase,
} from "lucide-react";
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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { stat } from "fs";

// Définir un type pour l'utilisateur
interface User {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  type: string;
  dateInscription: string;
  statut: string;
  image?: string;
  role: string;
}

export default function UtilisateursPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    assistant: 0,
    admin: 0,
    client: 0,
    agent: 0,
  });

  // Récupérer les utilisateurs avec les filtres
  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
        type: typeFilter === "all" ? "" : typeFilter,
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors du chargement des utilisateurs"
        );
      }
      setStats({
        total: data.users.length,
        assistant: data.assistants.length,
        admin: data.admins.length,
        client: data.clients.length,
        agent: data.agents.length,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      setError("Impossible de charger les utilisateurs");
      console.error("Erreur de récupération des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les utilisateurs lorsque les filtres ou la page changent
  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page, typeFilter]);

  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telephone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || user.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };
  const deleteUser = async (id: string, userType: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/users?userId=${id}&userType=${userType}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression.");
      }

      // Supprimer localement
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Erreur de suppression:", error);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/admin/utilisateurs/ajouter">
              <Plus className="h-4 w-4" />
              <span>Ajouter un utilisateur</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.admin}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des admins enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assistants</CardTitle>
            <Headset className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.assistant}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des assistants enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.agent}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des agents enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.client}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total des clients enregistrés
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Consultez et gérez tous les utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Rechercher par ID, nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Type d'utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
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
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Date d'inscription
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`/placeholder.svg?height=32&width=32`}
                              alt={user.nom}
                            />
                            <AvatarFallback>
                              {user.nom.split(" ")[0][0]}
                            </AvatarFallback>
                          </Avatar>
                          {user.nom}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell>{user.telephone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.dateInscription}
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
                            <DropdownMenuItem>
                              <Link
                                href={`/dashboard/admin/utilisateurs/${user.id}`}
                              >
                                Voir détails
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/admin/utilisateurs/ajouter?id=${user.id}`
                                )
                              }
                            >
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteUser(user.id, user.type.toLowerCase())
                              }
                            >
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredUsers.length} utilisateurs sur{" "}
            {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.page ===
                Math.ceil(pagination.total / pagination.limit)
              }
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
