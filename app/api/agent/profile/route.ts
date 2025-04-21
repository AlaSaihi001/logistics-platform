import { type NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { AgentService } from "@/lib/agent-service"
import { ApiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const agentId = Number.parseInt(user.id)
    const result = await AgentService.gererProfil(agentId)

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Impossible de récupérer le profil", { status: 400 })
    }

    return ApiResponse.success(result.agent)
  } catch (error) {
    console.error("Error in GET /api/agent/profile:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const agentId = Number.parseInt(user.id)
    const body = await req.json()

    const result = await AgentService.modifierProfil(agentId, body)

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Échec de la mise à jour du profil", { status: 400 })
    }

    return ApiResponse.success({ message: "Profil mis à jour avec succès" })
  } catch (error) {
    console.error("Error in PUT /api/agent/profile:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
