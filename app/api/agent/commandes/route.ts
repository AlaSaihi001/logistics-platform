import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { AgentService } from "@/lib/agent-service"
import { ApiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized("Accès refusé")
    }

    const agentId = Number.parseInt(user.id)
    const result = await AgentService.gererCommandes(agentId)

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Une erreur est survenue", { status: 400 });
    }
    

    return ApiResponse.success(result.commandes)
  } catch (error) {
    console.error("Error in GET /api/agent/commandes:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
