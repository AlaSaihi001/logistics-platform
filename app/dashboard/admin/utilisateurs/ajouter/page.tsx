import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [sendCredentials, setSendCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      userType,
      sendCredentials,
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`, // Use the token stored in localStorage
      },
      body: JSON.stringify(userData),
    });

    const result = await res.json();

    if (res.ok) {
      alert("User created successfully!");
      // Optionally reset the form or navigate to a different page
    } else {
      alert(result.error || "Something went wrong");
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
              Ajouter un utilisateur
            </h1>
            <p className="text-muted-foreground">
              Créez un nouveau compte utilisateur
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
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      className="pl-10"
                    />
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">Type d'utilisateur</Label>
                  <Select
                    value={userType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setUserType(e.target.value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type d'utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={sendCredentials}
                    onChange={(e) => setSendCredentials(e.target.checked)}
                  />
                  <Label htmlFor="sendCredentials">
                    Envoyer les identifiants par email
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter l'utilisateur
            </Button>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
