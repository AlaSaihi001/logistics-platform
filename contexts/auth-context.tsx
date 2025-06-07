"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export type UserRole = "CLIENT" | "AGENT" | "ASSISTANT" | "ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  indicatifTelephone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/client-auth/session");
        console.log("Res from checkAuth:", res);
        if (!res.ok) throw new Error("Non authentifié");

        const data = await res.json();
        setUser(data?.user || null);
        // router.push('/dashboard/client')
      } catch (err) {
        console.error("Erreur de session :", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    role?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      // console.log(email, password)

      let endpoint = "/api/client-auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("response", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la connexion");
      }

      const data = await response.json();
      console.log("data", data);
      setUser(data.user);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${data.user.name}!`,
      });

      // Redirection vers le tableau de bord approprié
      if (data?.user?.id) {
        console.log("Should redirect");
        // router.refresh();
        // router.push('/')
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la connexion";
      setError(message);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (userData.password !== userData.confirmPassword)
        throw new Error("Les mots de passe ne correspondent pas");

      const response = await fetch("/api/client-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      setUser(data.user);

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setError(message);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/client-auth/logout", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erreur lors de la déconnexion");

      setUser(null);
      router.push("/auth/login");

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext) ?? {};
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
