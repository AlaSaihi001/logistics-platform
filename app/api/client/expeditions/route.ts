import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ClientService } from "@/lib/client-service"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)

    // Récupération des expéditions via le service client
    const expeditions = await ClientService.suivreExpeditions(clientId)

    return Response.json(expeditions)
  } catch (error) {
    console.error("Erreur lors du suivi des expéditions:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
