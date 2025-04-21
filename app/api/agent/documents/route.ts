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
    const result = await AgentService.gererDocuments(agentId)

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Erreur inconnue", { status: 400 })
    }
    
    return ApiResponse.success(result.documents)
  } catch (error) {
    console.error("Error in GET /api/agent/documents:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const { nom, size, url, type } = await req.json()
    const agentId = Number.parseInt(user.id)

    const result = await AgentService.ajouterDocument(agentId, nom, size, url, type)
    
    if (!result.success) {
      return ApiResponse.error(result.error ?? "Erreur inconnue", { status: 400 })
    }

    return ApiResponse.success(result.document, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/agent/documents:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
