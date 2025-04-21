import { type NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { AgentService } from "@/lib/agent-service"
import { ApiResponse } from "@/lib/api-response"

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return ApiResponse.validationError({
        currentPassword: !currentPassword ? "Mot de passe actuel requis" : "",
        newPassword: !newPassword ? "Nouveau mot de passe requis" : "",
      })
    }

    const agentId = Number.parseInt(user.id)
    const result = await AgentService.modifierMotDePasse(agentId, currentPassword, newPassword)

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Échec de la mise à jour du mot de passe", { status: 400 })
    }

    return ApiResponse.success({ message: result.message })
  } catch (error) {
    console.error("Error in PUT /api/agent/password:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
