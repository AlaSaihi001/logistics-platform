import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { PrismaClient } from "@prisma/client"
import { ApiResponse } from "@/lib/api-response"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Récupération de l'utilisateur via JWT
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return ApiResponse.unauthorized()
    }

    const userId = Number.parseInt(user.id)

    // Comptage des commandes en attente
    const pendingOrders = await prisma.commande.count({
      where: {
        clientId: userId,
        statut: "En attente",
      },
    })

    // Comptage des factures en attente ou en retard
    const pendingInvoices = await prisma.facture.count({
      where: {
        commande: {
          clientId: userId,
        },
        status: {
          in: ["En attente", "En retard"],
        },
      },
    })

    // Comptage des notifications non lues
    const unreadNotifications = await prisma.notification.count({
      where: {
        clientId: userId,
        lu: false,
      },
    })

    return ApiResponse.success({
      pendingOrders,
      pendingInvoices,
      unreadNotifications,
    })
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques du tableau de bord client:", error)
    return ApiResponse.serverError("Erreur serveur")
  }
}
