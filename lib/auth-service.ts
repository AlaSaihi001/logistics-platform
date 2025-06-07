import { compare, hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Authentifier un client avec email et mot de passe
   */
  static async authenticateUser(
    email: string,
    password: string,
    role?: string
  ) {
    try {
      const user = await prisma.client.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          motDePasse: true,
          nom: true,
          prenom: true,
          role: true,
          image: true,
        },
      });
      if (!user) {
        return { success: false, error: "Identifiants incorrects" };
      }

      // Vérifier le rôle si précisé
      if (role && user.role !== role) {
        return {
          success: false,
          error: "Identifiants incorrects pour ce type de compte",
        };
      }

      // Vérifier le mot de passe
      console.log(password, user.motDePasse);
      const isValid = await compare(password, user.motDePasse);
      if (!isValid) {
        return { success: false, error: "Mot de passe incorrect" };
      }
      console.log(user);
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
          image: user.image,
        },
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'authentification",
      };
    }
  }

  /**
   * Enregistrer un nouveau client
   */
  static async registerUser(userData: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    indicatifTelephone: string;
    adresse: string;
  }) {
    try {
      const existingClient = await prisma.client.findUnique({
        where: { email: userData.email },
      });

      if (existingClient) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }

      const hashedPassword = await hash(userData.password, 12);

      const client = await prisma.client.create({
        data: {
          email: userData.email,
          motDePasse: hashedPassword,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: Number(userData.telephone),
          indicatifPaysTelephone: userData.indicatifTelephone,
          role: "CLIENT",
          adresse: userData.adresse,
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true,
          image: true,
        },
      });

      return {
        success: true,
        user: {
          id: client.id,
          email: client.email,
          name: `${client.prenom} ${client.nom}`,
          role: client.role,
          image: client.image,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'inscription",
      };
    }
  }

  /**
   * Modifier le mot de passe d’un client
   */
  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const user = await prisma.client.findUnique({
        where: { id: userId },
        select: { id: true, motDePasse: true },
      });

      if (!user) {
        return { success: false, error: "Client non trouvé" };
      }

      const isPasswordValid = await compare(currentPassword, user.motDePasse);
      if (!isPasswordValid) {
        return { success: false, error: "Mot de passe actuel incorrect" };
      }

      const hashedPassword = await hash(newPassword, 12);

      await prisma.client.update({
        where: { id: userId },
        data: { motDePasse: hashedPassword },
      });

      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        error: "Erreur lors du changement de mot de passe",
      };
    }
  }

  /**
   * Authentifier un assistant avec email et mot de passe
   */
  static async authenticateAssistant(email: string, password: string) {
    try {
      // Chercher l'assistant dans la base de données
      const assistant = await prisma.assistant.findUnique({
        where: { email: email },
      });

      if (!assistant) {
        return { success: false, message: "Assistant non trouvé" };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await compare(password, assistant.motDePasse);
      if (!isPasswordValid) {
        return { success: false, message: "Mot de passe invalide" };
      }

      return { success: true, user: assistant };
    } catch (error) {
      console.error("Erreur lors de l'authentification de l'assistant:", error);
      return { success: false, message: "Erreur interne" };
    }
  }

  /**
   * Enregistrer un assistant
   */
  static async registerAssistant(assistantData: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    indicatifTelephone: string;
  }) {
    try {
      const existingAssistant = await prisma.assistant.findUnique({
        where: { email: assistantData.email },
      });

      if (existingAssistant) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }

      const hashedPassword = await hash(assistantData.password, 12);

      const assistant = await prisma.assistant.create({
        data: {
          email: assistantData.email,
          motDePasse: hashedPassword,
          nom: assistantData.nom,
          prenom: assistantData.prenom,
          telephone: Number(assistantData.telephone),
          indicatifPaysTelephone: assistantData.indicatifTelephone,
          role: "ASSISTANT",
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true,
          image: true,
        },
      });

      return {
        success: true,
        user: {
          id: assistant.id,
          email: assistant.email,
          name: `${assistant.prenom} ${assistant.nom}`,
          role: assistant.role,
          image: assistant.image,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'inscription",
      };
    }
  }
}
