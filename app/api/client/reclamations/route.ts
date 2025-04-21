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

    let reclamations

    if (statusFilter) {
      // Filtrage par statut
      reclamations = await prisma.reclamation.findMany({
        where: {
          idClient: clientId,
          status: { in: statusFilter.split(",") },
        },
        orderBy: { date: "desc" },
      })
    } else {
      // Toutes les réclamations
      reclamations = await prisma.reclamation.findMany({
        where: { idClient: clientId },
        orderBy: { date: "desc" },
      })
    }

    return Response.json(reclamations)
  } catch (error) {
    console.error("Erreur lors de la récupération des réclamations:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const body = await req.json()

    // Champs requis
    if (!body.sujet || !body.description) {
      return Response.json(
        {
          error: "Données manquantes",
          details: "Le sujet et la description sont requis",
        },
        { status: 400 }
      )
    }

    // Dépôt de réclamation via le service client
    const reclamation = await ClientService.deposerReclamation(
      clientId,
      body.sujet,
      body.description,
      body.documents ? JSON.stringify(body.documents) : null
    )

    return Response.json(reclamation, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la réclamation:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
