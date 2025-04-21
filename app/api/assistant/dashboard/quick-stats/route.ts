import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ApiResponse } from "@/lib/api-response"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "ASSISTANT") {
      return ApiResponse.unauthorized()
    }

    const assistantId = parseInt(user.id)

    const [pendingOrders, pendingInvoices, openTickets, unreadNotifications] = await Promise.all([
      prisma.commande.count({
        where: {
          statut: "En attente",
        },
      }),
      prisma.facture.count({
        where: {
          status: "Non envoyée",
        },
      }),
      prisma.reclamation.count({
        where: {
          status: {
            in: ["Ouverte", "En cours"],
          },
        },
      }),
      prisma.notification.count({
        where: {
          assistantId,
          lu: false,
        },
      }),
    ])

    return ApiResponse.success({
      pendingOrders,
      pendingInvoices,
      openTickets,
      unreadNotifications,
    })
  } catch (error) {
    console.error("Error fetching assistant dashboard stats:", error)
    return ApiResponse.serverError("Une erreur est survenue lors du chargement des statistiques")
  }
}
