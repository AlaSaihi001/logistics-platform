import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getAssistantProfile(assistantId: number) {
  try {
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        indicatifPaysTelephone: true,
        image: true,
        createdAt: true,
      },
    })
    return assistant
  } catch (error) {
    console.error("Error fetching assistant profile:", error)
    throw new Error("Failed to fetch assistant profile")
  }
}

export async function updateAssistantProfile(assistantId: number, data: any) {
  try {
    const updatedAssistant = await prisma.assistant.update({
      where: { id: assistantId },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        indicatifPaysTelephone: data.indicatifPaysTelephone,
        image: data.image,
      },
    })
    return updatedAssistant
  } catch (error) {
    console.error("Error updating assistant profile:", error)
    throw new Error("Failed to update assistant profile")
  }
}

export async function updateAssistantPassword(assistantId: number, currentPassword: string, newPassword: string) {
  try {
    // First verify current password
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      select: { motDePasse: true },
    })

    if (!assistant) {
      throw new Error("Assistant not found")
    }

    // In a real app, you would use bcrypt to compare passwords
    if (assistant.motDePasse !== currentPassword) {
      throw new Error("Current password is incorrect")
    }

    // Update password
    const updatedAssistant = await prisma.assistant.update({
      where: { id: assistantId },
      data: { motDePasse: newPassword },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating assistant password:", error)
    throw error
  }
}

export async function getAssistantCommandes(assistantId: number) {
  try {
    const commandes = await prisma.commande.findMany({
      where: {
        OR: [
          { assistantId: assistantId },
          { status: "En attente", assistantId: null }, // Commandes not yet assigned
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        produits: true,
      },
      orderBy: { dateCommande: "desc" },
    })
    return commandes
  } catch (error) {
    console.error("Error fetching assistant commandes:", error)
    throw new Error("Failed to fetch commandes")
  }
}

export async function getCommandeDetails(commandeId: number) {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            indicatifPaysTelephone: true,
          },
        },
        produits: true,
        factures: true,
      },
    })
    return commande
  } catch (error) {
    console.error("Error fetching commande details:", error)
    throw new Error("Failed to fetch commande details")
  }
}

export async function validerCommande(commandeId: number, assistantId: number) {
  try {
    const updatedCommande = await prisma.commande.update({
      where: { id: commandeId },
      data: {
        status: "Validée",
        assistantId: assistantId,
      },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        clientId: updatedCommande.clientId,
        type: "Commande",
        correspond: `Votre commande ${updatedCommande.nom} a été validée`,
      },
    })

    return updatedCommande
  } catch (error) {
    console.error("Error validating commande:", error)
    throw new Error("Failed to validate commande")
  }
}

export async function rejeterCommande(commandeId: number, assistantId: number, raison: string) {
  try {
    const updatedCommande = await prisma.commande.update({
      where: { id: commandeId },
      data: {
        status: "Rejetée",
        assistantId: assistantId,
      },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        clientId: updatedCommande.clientId,
        type: "Commande",
        correspond: `Votre commande ${updatedCommande.nom} a été rejetée. Raison: ${raison}`,
      },
    })

    return updatedCommande
  } catch (error) {
    console.error("Error rejecting commande:", error)
    throw new Error("Failed to reject commande")
  }
}

export async function updateCommandeStatus(commandeId: number, status: string) {
  try {
    const updatedCommande = await prisma.commande.update({
      where: { id: commandeId },
      data: { status },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        clientId: updatedCommande.clientId,
        type: "Commande",
        correspond: `Le statut de votre commande ${updatedCommande.nom} a été mis à jour: ${status}`,
      },
    })

    return updatedCommande
  } catch (error) {
    console.error("Error updating commande status:", error)
    throw new Error("Failed to update commande status")
  }
}

export async function getAssistantFactures(assistantId: number) {
  try {
    const factures = await prisma.facture.findMany({
      where: { assistantId },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        commande: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { dateEmission: "desc" },
    })
    return factures
  } catch (error) {
    console.error("Error fetching assistant factures:", error)
    throw new Error("Failed to fetch factures")
  }
}

export async function getFactureDetails(factureId: number) {
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
        paiement: true,
      },
    })
    return facture
  } catch (error) {
    console.error("Error fetching facture details:", error)
    throw new Error("Failed to fetch facture details")
  }
}

export async function envoyerFactureClient(factureId: number) {
  try {
    const facture = await prisma.facture.update({
      where: { id: factureId },
      data: { status: "Envoyée" },
      include: { client: true },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        clientId: facture.idClient,
        type: "Facture",
        correspond: `Une nouvelle facture #${facture.numeroFacture} a été émise pour votre commande`,
      },
    })

    return facture
  } catch (error) {
    console.error("Error sending facture to client:", error)
    throw new Error("Failed to send facture to client")
  }
}

export async function getAssistantReclamations(assistantId: number) {
  try {
    const reclamations = await prisma.reclamation.findMany({
      where: {
        OR: [
          { assistantId },
          { status: "Ouverte", assistantId: null }, // Réclamations not yet assigned
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })
    return reclamations
  } catch (error) {
    console.error("Error fetching assistant reclamations:", error)
    throw new Error("Failed to fetch reclamations")
  }
}

export async function getReclamationDetails(reclamationId: number) {
  try {
    const reclamation = await prisma.reclamation.findUnique({
      where: { id: reclamationId },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            indicatifPaysTelephone: true,
          },
        },
      },
    })
    return reclamation
  } catch (error) {
    console.error("Error fetching reclamation details:", error)
    throw new Error("Failed to fetch reclamation details")
  }
}

export async function updateReclamationStatus(reclamationId: number, assistantId: number, status: string) {
  try {
    const updatedReclamation = await prisma.reclamation.update({
      where: { id: reclamationId },
      data: {
        status,
        assistantId,
      },
      include: { client: true },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        clientId: updatedReclamation.idClient,
        type: "Réclamation",
        correspond: `Le statut de votre réclamation "${updatedReclamation.sujet}" a été mis à jour: ${status}`,
      },
    })

    return updatedReclamation
  } catch (error) {
    console.error("Error updating reclamation status:", error)
    throw new Error("Failed to update reclamation status")
  }
}

export async function getAssistantNotifications(assistantId: number) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { assistantId },
      orderBy: { dateEmission: "desc" },
    })
    return notifications
  } catch (error) {
    console.error("Error fetching assistant notifications:", error)
    throw new Error("Failed to fetch notifications")
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { lu: true },
    })
    return updatedNotification
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw new Error("Failed to mark notification as read")
  }
}
