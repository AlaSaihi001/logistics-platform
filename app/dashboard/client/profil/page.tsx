"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  AlertTriangle,
  RefreshCw,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClientProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  indicatifPaysTelephone: string;
  telephone: number;
  image: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    indicatifPaysTelephone: "",
    telephone: "",
    image: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/client/profile");
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Erreur lors du chargement du profil (${response.status})`
        );
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        indicatifPaysTelephone: data.indicatifPaysTelephone,
        telephone: data.telephone.toString(),
        image: data.image || "",
        address: data.adresse || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors du chargement du profil"
      );
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est requis";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }

    if (!formData.indicatifPaysTelephone.trim()) {
      errors.indicatifPaysTelephone = "L'indicatif est requis";
    }

    if (!formData.telephone.trim()) {
      errors.telephone = "Le numéro de téléphone est requis";
    } else if (!/^\d+$/.test(formData.telephone)) {
      errors.telephone =
        "Le numéro de téléphone doit contenir uniquement des chiffres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Le mot de passe actuel est requis";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "Le nouveau mot de passe est requis";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Erreur lors de la mise à jour du profil (${response.status})`
        );
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/client/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Erreur lors de la mise à jour du mot de passe (${response.status})`
        );
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès",
      });

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour votre mot de passe",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchProfile}>
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>

        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    );
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {formData.image ? (
                          <img
                            src={formData.image || "/placeholder.svg"}
                            alt={`${formData.prenom} ${formData.nom}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="image"
                          className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-sm cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Photo de profil</h3>
                      <p className="text-sm text-muted-foreground">
                        Cette photo sera affichée sur votre profil
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <div className="relative">
                        <Input
                          id="prenom"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          className={`pl-10 ${
                            formErrors.prenom ? "border-red-500" : ""
                          }`}
                        />
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                      {formErrors.prenom && (
                        <p className="text-sm text-red-500">
                          {formErrors.prenom}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <div className="relative">
                        <Input
                          id="nom"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          className={`pl-10 ${
                            formErrors.nom ? "border-red-500" : ""
                          }`}
                        />
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                      {formErrors.nom && (
                        <p className="text-sm text-red-500">{formErrors.nom}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 ${
                          formErrors.email ? "border-red-500" : ""
                        }`}
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {formErrors.email && (
                      <p className="text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Address</Label>
                    <div className="relative">
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className={`pl-10 ${
                          formErrors.email ? "border-red-500" : ""
                        }`}
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {formErrors.email && (
                      <p className="text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Numéro de téléphone</Label>
                    <div className="flex">
                      <div className="relative w-20 flex-shrink-0">
                        <Input
                          id="indicatifPaysTelephone"
                          name="indicatifPaysTelephone"
                          value={formData.indicatifPaysTelephone}
                          onChange={handleChange}
                          className={`pl-10 rounded-r-none ${
                            formErrors.indicatifPaysTelephone
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className={`flex-1 rounded-l-none ${
                          formErrors.telephone ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {(formErrors.indicatifPaysTelephone ||
                      formErrors.telephone) && (
                      <p className="text-sm text-red-500">
                        {formErrors.indicatifPaysTelephone ||
                          formErrors.telephone}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Enregistrement..."
                      : "Enregistrer les modifications"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>
                    Mettez à jour votre mot de passe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`pl-10 ${
                          passwordErrors.currentPassword ? "border-red-500" : ""
                        }`}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`pl-10 ${
                          passwordErrors.newPassword ? "border-red-500" : ""
                        }`}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {passwordErrors.newPassword ? (
                      <p className="text-sm text-red-500">
                        {passwordErrors.newPassword}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Le mot de passe doit contenir au moins 8 caractères
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`pl-10 ${
                          passwordErrors.confirmPassword ? "border-red-500" : ""
                        }`}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setActiveTab("profile")}
                  >
                    Retour
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Mise à jour..."
                      : "Mettre à jour le mot de passe"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
