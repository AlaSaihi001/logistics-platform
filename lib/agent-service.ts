import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";

const prisma = new PrismaClient();

export class AgentService {
  // Authentication
  static async s_authentifier(email: string, password: string) {
    try {
      const agent = await prisma.agent.findUnique({ where: { email } });
      if (!agent)
        return { success: false, error: "Email ou mot de passe incorrect" };

      const passwordMatch = await compare(password, agent.motDePasse);
      if (!passwordMatch)
        return { success: false, error: "Email ou mot de passe incorrect" };

      return {
        success: true,
        id: agent.id,
        nom: agent.nom,
        prenom: agent.prenom,
        email: agent.email,
        role: agent.role,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'authentification",
      };
    }
  }
  // Dashboard
  static async getStats(agentId: number, dateFrom: string, dateTo: string) {
    try {
      const expeditionsEnCours = await prisma.commande.count({
        where: {
          agentId,
          statut: "Expédiée",
          dateCommande: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
      });
      const expeditionsUrgentes = await prisma.commande.count({
        where: {
          agentId,
          statut: "Livrée",
          dateCommande: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
      });
      const documentsAValider = await prisma.document.count({
        where: {
          idAgent: agentId,
          statut: "À valider",
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
      });
      const facturesAEnvoyer = await prisma.facture.count({
        where: {
          idAgent: agentId,
          status: "En attente",
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
      });
      const stats = {
        expeditionsEnCours,
        documentsAValider,
        facturesAEnvoyer,
        expeditionsUrgentes,
      };
      return stats;
    } catch (error) {
      console.error("Error fetching agent stats:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de la récupération des statistiques",
      };
    }
  }
  static async getUrgent(agentId: number) {
    try {
      const urgent = await prisma.commande.findMany({
        where: { statut: "Expédiée", agentId: agentId },
        include: {
          client: true,
        },
      });
      return urgent;
    } catch (error) {
      console.error("Error fetching agent profile:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération du profil",
      };
    }
  }
  static async getDashDocs(agentId: number) {
    try {
      const urgent = await prisma.document.findMany({
        where: { statut: "À valider", idAgent: agentId },
      });
      return urgent;
    } catch (error) {
      console.error("Error fetching agent profile:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération du profil",
      };
    }
  }
  static async getRecent(agentId: number) {
    try {
      const recent = await prisma.commande.findMany({
        where: { agentId: agentId },
        include: {
          client: true,
        },
      });
      return recent;
    } catch (error) {
      console.error("Error fetching agent profile:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération du profil",
      };
    }
  }
  // Profile management
  static async gererProfil(agentId: number) {
    try {
      const agent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent) return { success: false, error: "Agent non trouvé" };

      return {
        success: true,
        agent: {
          id: agent.id,
          nom: agent.nom,
          prenom: agent.prenom,
          email: agent.email,
          indicatifPaysTelephone: agent.indicatifPaysTelephone,
          telephone: agent.telephone,
          image: agent.image,
        },
      };
    } catch (error) {
      console.error("Error fetching agent profile:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération du profil",
      };
    }
  }

  static async modifierProfil(agentId: number, data: any) {
    try {
      const updated = await prisma.agent.update({
        where: { id: agentId },
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          indicatifPaysTelephone: data.indicatifPaysTelephone,
          telephone: Number.parseInt(data.telephone),
          image: data.image,
        },
      });

      return { success: true, agent: updated };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil agent:", error);
      return {
        success: false,
        error: "Impossible de mettre à jour le profil.",
      };
    }
  }

  static async modifierMotDePasse(
    agentId: number,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const agent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent) return { success: false, error: "Agent non trouvé" };
      if (agent.motDePasse !== currentPassword) {
        return { success: false, error: "Mot de passe actuel incorrect" };
      }
      await prisma.agent.update({
        where: { id: agentId },
        data: { motDePasse: newPassword },
      });

      return { success: true, message: "Mot de passe modifié avec succès" };
    } catch (error) {
      console.error("Error updating password:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de la modification du mot de passe",
      };
    }
  }

  // Order management
  static async gererCommandes(agentId: number) {
    try {
      const commandes = await prisma.commande.findMany({
        where: { agentId },
        include: {
          client: true,
          produits: true,
        },
        orderBy: { dateCommande: "desc" },
      });

      return { success: true, commandes };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération des commandes",
      };
    }
  }

  static async accepterCommande(commandeId: number, agentId: number) {
    try {
      const updatedCommande = await prisma.commande.update({
        where: { id: commandeId },
        data: {
          statut: "Validée",
          agentId: agentId,
        },
      });
      // Create notification for client
      await prisma.notification.create({
        data: {
          clientId: updatedCommande.clientId,
          type: "Commande",
          correspond: `Votre commande ${updatedCommande.nom} a été validée`,
        },
      });

      return updatedCommande;
    } catch (error) {
      console.error("Error validating commande:", error);
      throw new Error("Failed to validate commande");
    }
  }

  static async refuserCommande(
    commandeId: number,
    agentId: number,
    raison: string
  ) {
    try {
      const updatedCommande = await prisma.commande.update({
        where: { id: commandeId },
        data: {
          statut: "Rejetée",
          assistantId: agentId,
        },
      });

      // Create notification for client
      await prisma.notification.create({
        data: {
          clientId: updatedCommande.clientId,
          type: "Commande",
          correspond: `Votre commande ${updatedCommande.nom} a été rejetée. Raison: ${raison}`,
        },
      });

      return updatedCommande;
    } catch (error) {
      console.error("Error rejecting commande:", error);
      throw new Error("Failed to reject commande");
    }
  }

  static async changerStatut(commandeId: number, nouveauStatut: string) {
    try {
      const commande = await prisma.commande.findUnique({
        where: { id: commandeId },
      });

      if (!commande) {
        return { success: false, error: "Commande non trouvée" };
      }

      const statutsValides = [
        "En attente",
        "Acceptée",
        "En cours",
        "Expédiée",
        "Livrée",
        "Annulée",
      ];
      if (!statutsValides.includes(nouveauStatut)) {
        return { success: false, error: "Statut invalide" };
      }

      const updatedCommande = await prisma.commande.update({
        where: { id: commandeId },
        data: {
          statut: nouveauStatut,
        },
      });

      // Create notification for client
      await prisma.notification.create({
        data: {
          type: "Commande",
          correspond: `Le statut de votre commande ${commande.nom} a été mis à jour: ${nouveauStatut}`,
          clientId: commande.clientId,
        },
      });

      return { success: true, commande: updatedCommande };
    } catch (error) {
      console.error("Error changing order status:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors du changement de statut de la commande",
      };
    }
  }
  static async changerAdress(commandeId: number, adress: string) {
    try {
      const commande = await prisma.commande.findUnique({
        where: { id: commandeId },
      });

      if (!commande) {
        return { success: false, error: "Commande non trouvée" };
      }

      if (!adress) {
        return { success: false, error: "Statut invalide" };
      }

      const updatedCommande = await prisma.commande.update({
        where: { id: commandeId },
        data: {
          adresseActuel: adress,
        },
      });

      // Create notification for client
      await prisma.notification.create({
        data: {
          type: "Commande",
          correspond: `L'addresse actuelle de votre commande ${commande.nom} a été mis à jour: ${adress}`,
          clientId: commande.clientId,
        },
      });

      return { success: true, commande: updatedCommande };
    } catch (error) {
      console.error("Error changing order status:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors du changement de statut de la commande",
      };
    }
  }
  // Invoice management
  static async getFacture(factureId: number) {
    try {
      const facture = await prisma.facture.findUnique({
        where: { id: factureId },
        include: {
          client: true,
          commande: {
            include: {
              produits: true,
            },
          },
        },
      });

      return facture;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération des factures",
      };
    }
  }
  static async gererFactures(agentId: number) {
    try {
      const factures = await prisma.facture.findMany({
        where: { idAgent: agentId },
        include: {
          client: true,
          commande: true,
        },
        orderBy: { dateEmission: "desc" },
      });

      return { success: true, factures };
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération des factures",
      };
    }
  }
  static async createFactures(
    agentId: number,
    clientId: number,
    commandeId: number,
    fileUrl: string,
    montant: number,
    status: string
  ) {
    try {
      const facture = await prisma.facture.create({
        data: {
          idAgent: agentId,
          idClient: clientId,
          idCommande: commandeId,
          dateEmission: new Date(),
          montant: montant,
          numeroFacture: Math.floor(Math.random() * 1000000), // Example unique number generation
          document: fileUrl,
          status: status, // Optional: already defaulted by Prisma
        },
      });
      return facture;
    } catch (error) {
      console.error("Error Creating invoice:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la création de la facture",
      };
    }
  }
  static async telechargerFacture(factureId: number) {
    try {
      const facture = await prisma.facture.findUnique({
        where: { id: factureId },
        include: {
          client: true,
          commande: true,
        },
      });

      if (!facture) {
        return { success: false, error: "Facture non trouvée" };
      }

      if (!facture.document) {
        return { success: false, error: "Document de facture non disponible" };
      }

      return { success: true, documentUrl: facture.document };
    } catch (error) {
      console.error("Error downloading invoice:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors du téléchargement de la facture",
      };
    }
  }

  static async imprimerFacture(factureId: number) {
    try {
      const facture = await prisma.facture.findUnique({
        where: { id: factureId },
        include: {
          client: true,
          commande: true,
        },
      });

      if (!facture) {
        return { success: false, error: "Facture non trouvée" };
      }

      // In a real application, this would generate a printable version
      return { success: true, facture };
    } catch (error) {
      console.error("Error printing invoice:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'impression de la facture",
      };
    }
  }

  static async envoyerClient(factureId: number) {
    try {
      const facture = await prisma.facture.findUnique({
        where: { id: factureId },
        include: {
          client: true,
        },
      });

      if (!facture) {
        return { success: false, error: "Facture non trouvée" };
      }
      const updatedFacture = await prisma.facture.update({
        where: { id: factureId },
        data: {
          status: "Envoyée",
        },
      });

      // Create notification for client
      await prisma.notification.create({
        data: {
          type: "Facture",
          correspond: `Une nouvelle facture (#${facture.numeroFacture}) vous a été envoyée`,
          clientId: facture.idClient,
        },
      });

      return { success: true, facture: updatedFacture };
    } catch (error) {
      console.error("Error sending invoice to client:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de l'envoi de la facture au client",
      };
    }
  }

  static async PaidFacture(factureId: number) {
    try {
      const facture = await prisma.facture.findUnique({
        where: { id: factureId },
        include: {
          client: true,
        },
      });

      if (!facture) {
        return { success: false, error: "Facture non trouvée" };
      }
      const updatedFacture = await prisma.facture.update({
        where: { id: factureId },
        data: {
          status: "Payée",
        },
      });

      // Create notification for client
      await prisma.notification.create({
        data: {
          type: "Facture",
          correspond: `Une nouvelle facture (#${facture.numeroFacture}) vous a été payée`,
          clientId: facture.idClient,
        },
      });

      return { success: true, facture: updatedFacture };
    } catch (error) {
      console.error("Error sending invoice to client:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de l'envoi de la facture au client",
      };
    }
  }

  static async getallDocuments(agentId: number) {
    try {
      const documents = await prisma.document.findMany({
        where: { idAgent: agentId },
        orderBy: { createdAt: "desc" },
      });

      return documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return error;
    }
  }
  // Document management
  static async gererDocuments(agentId: number, commandeId: number) {
    try {
      const documents = await prisma.document.findMany({
        where: { idAgent: agentId, commandeId: commandeId },
        orderBy: { createdAt: "desc" },
      });

      return documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la récupération des documents",
      };
    }
  }

  static async telechargerDocument(documentId: number) {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return { success: false, error: "Document non trouvé" };
      }

      return { success: true, documentUrl: document.url };
    } catch (error) {
      console.error("Error downloading document:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors du téléchargement du document",
      };
    }
  }

  static async ajouterDocument(
    commandeId: number,
    agentId: number,
    nom: string,
    size: number,
    url: string,
    type: string
  ) {
    try {
      const newDocument = await prisma.document.create({
        data: {
          commandeId: commandeId,
          idAgent: agentId,
          nom,
          size,
          url,
          type,
        },
      });

      return newDocument;
    } catch (error) {
      console.error("Error adding document:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'ajout du document",
      };
    }
  }
  static async supprimerDocument(documentId: number) {
    try {
      await prisma.document.delete({
        where: { id: documentId },
      });
      return { success: true };
    } catch (error) {
      console.error("Error Deleting document:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la suppression du document",
      };
    }
  }
  // Notification management
  static async recevoirNotification(agentId: number) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { agentId },
        orderBy: { dateEmission: "desc" },
      });

      return { success: true, notifications };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de la récupération des notifications",
      };
    }
  }

  static async marquerLuNotification(notificationId: number) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return { success: false, error: "Notification non trouvée" };
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          lu: true,
        },
      });

      return { success: true, notification: updatedNotification };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        error:
          "Une erreur est survenue lors du marquage de la notification comme lue",
      };
    }
  }
}
