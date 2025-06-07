"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Phone, UserPlus } from "lucide-react";
import Link from "next/link";
import { ChangeEvent } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function AddUserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [sendCredentials, setSendCredentials] = useState(false);
  const [indicatifPaysTelephone, setIndicatifPaysTelephone] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [address, setAddress] = useState("");
  // Fetch user data if editing
  useEffect(() => {
    if (userId) {
      setIsEditMode(true);

      fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFirstName(data.prenom || "");
            setLastName(data.nomFamille || "");
            setEmail(data.email || "");
            setPhone(data.telephone?.toString() || "");
            setIndicatifPaysTelephone(data.indicatifPaysTelephone || "");
            setUserType(data.type || "");
            setAddress(data.adresse || "");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
        });
    }
  }, [userId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const numericPhone = parseInt(phone.replace(/\D/g, ""), 10);
    const userData = {
      ...(isEditMode && { id: userId }),
      firstName: firstName,
      lastName: lastName,
      email: email,
      numericPhone: numericPhone,
      indicatifPaysTelephone: indicatifPaysTelephone,
      password: isEditMode && !password ? undefined : password,
      userType: userType,
      sendCredentials: sendCredentials,
      address: address,
    };
    console.log("🔼 Sending userData to API:", userData);
    console.log("🧾 JSON.stringify(userData):", JSON.stringify(userData));
    const res = await fetch(`/api/admin/users/`, {
      method: isEditMode ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
      body: JSON.stringify(userData),
    });
    const result = await res.json();

    if (res.ok) {
      alert(`Utilisateur ${isEditMode ? "modifié" : "créé"} avec succès !`);
      router.push("/dashboard/admin/utilisateurs");
    } else {
      alert(result.error || "Une erreur est survenue");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/utilisateurs">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode
                ? "Modifier un utilisateur"
                : "Ajouter un utilisateur"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Modifiez les informations de l'utilisateur"
                : "Créez un nouveau compte utilisateur"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="w-full">
          <TabsContent value="details" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Entrez les informations personnelles de l'utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="flex space-x-2 items-center">
                    <Input
                      id="indicatifPaysTelephone"
                      type="text"
                      value={indicatifPaysTelephone}
                      onChange={(e) =>
                        setIndicatifPaysTelephone(e.target.value)
                      }
                      placeholder="+212"
                      className="w-20 text-center"
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="6XX XXX XXX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>
                  Configurez les détails du compte utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        isEditMode ? "Laisser vide pour ne pas changer" : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={
                        isEditMode ? "Laisser vide pour ne pas changer" : ""
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">Type d'utilisateur</Label>
                  <Select
                    value={userType}
                    onValueChange={(value) => setUserType(value)}
                  >
                    <SelectTrigger id="userType">
                      <SelectValue placeholder="Sélectionnez un type d'utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="administrateur">
                        Administrateur
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendCredentials"
                    checked={sendCredentials}
                    onCheckedChange={(checked) => setSendCredentials(!!checked)}
                  />
                  <Label htmlFor="sendCredentials">
                    Envoyer les identifiants par email
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              {isEditMode
                ? "Mettre à jour l'utilisateur"
                : "Ajouter l'utilisateur"}
            </Button>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
