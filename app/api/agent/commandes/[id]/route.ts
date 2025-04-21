import type { NextRequest } from "next/server"
import { ApiResponse } from "@/lib/api-response"
import { getUserFromToken } from "@/lib/jwt-utils"
import { AgentService } from "@/lib/agent-service"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const commandeId = Number.parseInt(params.id)
    // 🔧 Remplacer ceci par un appel réel si disponible
    return ApiResponse.success({ id: commandeId, message: "Détails de la commande" })
  } catch (error) {
    console.error(`Error in GET /api/agent/commandes/${params.id}:`, error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const commandeId = Number.parseInt(params.id)
    const { action, raison, nouveauStatut } = await req.json()
    const agentId = Number.parseInt(user.id)

    let result

    if (action === "accepter") {
      result = await AgentService.accepterCommande(commandeId, agentId)
    } else if (action === "refuser") {
      result = await AgentService.refuserCommande(commandeId, raison)
    } else if (action === "changerStatut") {
      result = await AgentService.changerStatut(commandeId, nouveauStatut)
    } else {
      return ApiResponse.error("Action non valide", { status: 400 })
    }

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Erreur inconnue", { status: 400 })
    }

    return ApiResponse.success(result.commande)
  } catch (error) {
    console.error(`Error in PUT /api/agent/commandes/${params.id}:`, error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
