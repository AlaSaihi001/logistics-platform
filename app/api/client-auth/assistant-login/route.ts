import { compare, hash } from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class AuthService {
  // Authentifier un client
  static async authenticateUser(email: string, password: string, role?: string) {
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
      })

      if (!user) {
        return { success: false, error: "Identifiants incorrects" }
      }

      if (role && user.role !== role) {
        return { success: false, error: "Rôle non autorisé" }
      }

      const isPasswordValid = await compare(password, user.motDePasse)
      if (!isPasswordValid) {
        return { success: false, error: "Mot de passe incorrect" }
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
          image: user.image,
        },
      }
    } catch (error) {
      console.error("Erreur d'authentification :", error)
      return { success: false, error: "Erreur interne" }
    }
  }

  // Authentifier un assistant
  static async authenticateAssistant(email: string, password: string) {
    try {
      const assistant = await prisma.assistant.findUnique({
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
      })

      if (!assistant) {
        return { success: false, error: "Identifiants incorrects" }
      }

      const isPasswordValid = await compare(password, assistant.motDePasse)
      if (!isPasswordValid) {
        return { success: false, error: "Mot de passe incorrect" }
      }

      return {
        success: true,
        user: {
          id: assistant.id,
          email: assistant.email,
          name: `${assistant.prenom} ${assistant.nom}`,
          role: assistant.role,
          image: assistant.image,
        },
      }
    } catch (error) {
      console.error("Erreur assistant login :", error)
      return { success: false, error: "Erreur interne" }
    }
  }

  // Enregistrer un nouveau client
  static async registerUser(userData: {
    email: string
    password: string
    nom: string
    prenom: string
    telephone: string
    indicatifTelephone: string
  }) {
    try {
      const existingClient = await prisma.client.findUnique({
        where: { email: userData.email },
      })

      if (existingClient) {
        return { success: false, error: "Cet email est déjà utilisé" }
      }

      const hashedPassword = await hash(userData.password, 12)

      const client = await prisma.client.create({
        data: {
          email: userData.email,
          motDePasse: hashedPassword,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: parseInt(userData.telephone),
          indicatifPaysTelephone: userData.indicatifTelephone,
          role: "CLIENT",
        },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true,
          image: true,
        },
      })

      return {
        success: true,
        user: {
          id: client.id,
          email: client.email,
          name: `${client.prenom} ${client.nom}`,
          role: client.role,
          image: client.image,
        },
      }
    } catch (error) {
      console.error("Erreur enregistrement client :", error)
      return { success: false, error: "Erreur interne à l'inscription" }
    }
  }

  // Modifier mot de passe client
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.client.findUnique({
        where: { id: userId },
        select: {
          id: true,
          motDePasse: true,
        },
      })

      if (!user) {
        return { success: false, error: "Client non trouvé" }
      }

      const isPasswordValid = await compare(currentPassword, user.motDePasse)
      if (!isPasswordValid) {
        return { success: false, error: "Mot de passe actuel incorrect" }
      }

      const hashedPassword = await hash(newPassword, 12)

      await prisma.client.update({
        where: { id: userId },
        data: { motDePasse: hashedPassword },
      })

      return { success: true }
    } catch (error) {
      console.error("Erreur changement mot de passe :", error)
      return { success: false, error: "Erreur interne" }
    }
  }
}
