"use client";

import type React from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { User, Mail, Phone, Lock, Save, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";

interface profile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: number;
  indicatifPaysTelephone: string;
  image: string | null;
}

export default function ProfilPage() {
  const { toast } = useToast();
  const { user, isLoading, requireAuth } = useAuthSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    indicatifPaysTelephone: "",
  });
  const [profile, setProfile] = useState<profile | null>(null);

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
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
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agent/profile");
        if (!response.ok)
          throw new Error("Erreur lors du chargement du profil");

        const data = await response.json();
        setProfile(data);
        setFormData({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone.toString(),
          indicatifPaysTelephone: data.indicatifPaysTelephone,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast, isAuthorized]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/agent/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          telephone: Number.parseInt(formData.telephone),
        }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du profil");

      const updatedProfile = await response.json();
      setProfile(updatedProfile);

      toast({
        title: "Profil mis à jour",
        description:
          "Vos informations personnelles ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.new !== password.confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/agent/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors du changement de mot de passe"
        );
      }

      toast({
        title: "Mot de passe changé",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      setPassword({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible de changer votre mot de passe",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    // Ici, vous implémenteriez la logique de déconnexion
    console.log("Déconnexion");
    // Redirection vers la page de connexion
    // window.location.href = "/auth/agent/login"
  };
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos paramètres
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-background">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage
                    src={
                      avatarPreview ||
                      profile?.image ||
                      "/placeholder.svg?height=96&width=96"
                    }
                    alt={`${profile?.prenom} ${profile?.nom}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profile?.prenom?.[0]}
                    {profile?.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">Changer l'avatar</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {formData?.prenom}
                {formData?.nom}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">
              {formData?.prenom} {formData?.nom}
            </h3>
            <p className="text-muted-foreground">{formData?.role}</p>
            <div className="mt-6 space-y-3 w-full text-left">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base break-all">
                  {formData?.email}
                </span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base">
                  {formData?.telephone}
                </span>
              </div>
            </div>
            <div className="mt-6 w-full">
              <Link href="/auth/logout" className="w-full">
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="lg:w-2/3">
          <Tabs defaultValue="informations" className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <TabsList>
                <TabsTrigger value="informations">
                  Informations personnelles
                </TabsTrigger>
                <TabsTrigger value="securite">Sécurité</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="informations">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prenom">Prénom</Label>
                          <Input
                            id="prenom"
                            name="prenom"
                            value={formData?.prenom}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom</Label>
                          <Input
                            id="nom"
                            name="nom"
                            value={formData?.nom}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData?.email}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                          id="telephone"
                          name="telephone"
                          value={formData?.telephone}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="securite">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>
                    Mettez à jour votre mot de passe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current">Mot de passe actuel</Label>
                        <Input
                          id="current"
                          name="current"
                          type="password"
                          value={password.current}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">Nouveau mot de passe</Label>
                        <Input
                          id="new"
                          name="new"
                          type="password"
                          value={password.new}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">
                          Confirmer le nouveau mot de passe
                        </Label>
                        <Input
                          id="confirm"
                          name="confirm"
                          type="password"
                          value={password.confirm}
                          onChange={handlePasswordChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full sm:w-auto">
                      <Lock className="mr-2 h-4 w-4" />
                      Changer le mot de passe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
