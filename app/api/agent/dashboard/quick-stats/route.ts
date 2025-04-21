import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ApiResponse } from "@/lib/api-response"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const agentId = Number(user.id)

    const pendingOrders = await prisma.commande.count({
      where: {
        statut: "Acceptée", // ✅ corriger ici
        agentId,
      },
    })

    const pendingDocuments = await prisma.document.count({
      where: {
        statut: "À valider",
        idAgent: agentId,
      },
    })
    
    

    const pendingInvoices = await prisma.facture.count({
      where: {
        status: "À envoyer",
        commande: {
          agentId,
        },
      },
    })
    

    const unreadNotifications = await prisma.notification.count({
      where: {
        agentId: agentId, // ou assistantId / clientId selon le contexte
        lu: false,
      },
    })
    

    return ApiResponse.success({
      pendingOrders,
      pendingDocuments,
      pendingInvoices,
      unreadNotifications,
    })
  } catch (error) {
    console.error("Error fetching agent dashboard stats:", error)
    return ApiResponse.serverError("Une erreur est survenue lors du chargement des statistiques")
  }
}
