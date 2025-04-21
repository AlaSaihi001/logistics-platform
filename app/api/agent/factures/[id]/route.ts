import { type NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { AgentService } from "@/lib/agent-service"
import { ApiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const factureId = Number.parseInt(params.id)

    // 👉 Tu peux compléter ici avec une vraie méthode si besoin
    return ApiResponse.success({ id: factureId, message: "Détails de la facture" })
  } catch (error) {
    console.error(`Error in GET /api/agent/factures/${params.id}:`, error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const factureId = Number.parseInt(params.id)
    const { action } = await req.json()

    let result

    if (action === "telecharger") {
      result = await AgentService.telechargerFacture(factureId)
    } else if (action === "imprimer") {
      result = await AgentService.imprimerFacture(factureId)
    } else if (action === "envoyer") {
      result = await AgentService.envoyerClient(factureId)
    } else {
      return ApiResponse.error("Action non valide", { status: 400 })
    }

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Action échouée", { status: 400 })
    }

    return ApiResponse.success(result)
  } catch (error) {
    console.error(`Error in PUT /api/agent/factures/${params.id}:`, error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
