import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import prisma from "@/lib/prisma"
import { ClientService } from "@/lib/client-service"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const statusFilter = req.nextUrl.searchParams.get("status")

    let factures

    if (statusFilter) {
      // Filtrage par statut si précisé
      factures = await prisma.facture.findMany({
        where: {
          idClient: clientId,
          status: { in: statusFilter.split(",") },
        },
        include: {
          commande: true,
          paiement: true,
        },
        orderBy: { dateEmission: "desc" },
      })
    } else {
      // Sinon, toutes les factures
      factures = await ClientService.gererFactures(clientId)
    }

    return Response.json(factures)
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
