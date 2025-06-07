import prisma from "@/lib/prisma";
import { hash, compare } from "bcrypt";

export class ClientService {
  /**
   * Authenticate a client
   */
  static async sAuthentifier(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const client = await prisma.client.findUnique({
        where: { email },
      });

      if (!client) {
        return false;
      }

      const passwordMatch = await compare(password, client.motDePasse);
      return passwordMatch;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  }

  /**
   * Get client profile
   */
  static async gererProfil(clientId: number) {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          indicatifPaysTelephone: true,
          telephone: true,
          image: true,
          adresse: true,
          // Exclude password
        },
      });

      return client;
    } catch (error) {
      console.error("Error fetching client profile:", error);
      throw new Error("Impossible de récupérer le profil");
    }
  }

  /**
   * Update client password
   */
  static async modifierMotDePasse(
    clientId: number,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      // Verify current password
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new Error("Client non trouvé");
      }

      const passwordMatch = await compare(currentPassword, client.motDePasse);
      if (!passwordMatch) {
        throw new Error("Mot de passe actuel incorrect");
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 12);

      // Update password
      await prisma.client.update({
        where: { id: clientId },
        data: { motDePasse: hashedPassword },
      });

      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  /**
   * Get client orders
   */
  static async gererCommandes(clientId: number) {
    try {
      const commandes = await prisma.commande.findMany({
        where: { clientId },
        include: {
          produits: true,
          factures: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return commandes;
    } catch (error) {
      console.error("Error fetching client orders:", error);
      throw new Error("Impossible de récupérer les commandes");
    }
  }

  /**
   * Get client payments
   */
  static async gererPaiements(clientId: number) {
    try {
      const paiements = await prisma.paiement.findMany({
        where: { clientId },
        include: {
          facture: {
            include: {
              commande: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return paiements;
    } catch (error) {
      console.error("Error fetching client payments:", error);
      throw new Error("Impossible de récupérer les paiements");
    }
  }

  /**
   * Get client invoices
   */
  static async gererFactures(clientId: number) {
    try {
      const factures = await prisma.facture.findMany({
        where: { idClient: clientId },
        include: {
          commande: true,
          paiement: true,
        },
        orderBy: { dateEmission: "desc" },
      });

      return factures;
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      throw new Error("Impossible de récupérer les factures");
    }
  }

  /**
   * Track shipments
   */
  static async suivreExpeditions(clientId: number) {
    try {
      const commandes = await prisma.commande.findMany({
        where: {
          clientId,
          statut: {
            in: ["Expediee", "En transit", "Livree"],
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return commandes;
    } catch (error) {
      console.error("Error tracking shipments:", error);
      throw new Error("Impossible de suivre les expéditions");
    }
  }

  /**
   * Get client notifications
   */
  static async recevoirNotifications(clientId: number) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { clientId },
        orderBy: { dateEmission: "desc" },
      });

      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Impossible de récupérer les notifications");
    }
  }

  /**
   * Submit a claim
   */
  static async deposerReclamation(
    clientId: number,
    sujet: string,
    description: string,
    documents: string | null
  ) {
    try {
      const reclamation = await prisma.reclamation.create({
        data: {
          idClient: clientId,
          sujet,
          description,
          documents,
          status: "Ouverte",
          date: new Date(),
        },
      });

      // Create notification for assistants
      await prisma.notification.create({
        data: {
          type: "reclamation",
          correspond: `Une nouvelle réclamation a été créée: ${reclamation.sujet}.`,
          lu: false,
          // Send to all assistants (in a real app, you might want to send to specific assistants)
        },
      });

      return reclamation;
    } catch (error) {
      console.error("Error submitting claim:", error);
      throw new Error("Impossible de déposer la réclamation");
    }
  }
}
