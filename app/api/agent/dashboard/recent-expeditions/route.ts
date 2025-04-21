import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ApiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    // Simulation de données mock – à remplacer par une vraie requête Prisma si besoin
    await new Promise((resolve) => setTimeout(resolve, 800))

    const recentExpeditions = [
      { id: "EXP-2023-089", client: "TechGlobal", date: "15/03/2023", status: "en-cours" },
      { id: "EXP-2023-088", client: "FashionRetail", date: "14/03/2023", status: "expedie" },
      { id: "EXP-2023-087", client: "AutoParts", date: "12/03/2023", status: "livre" },
      { id: "EXP-2023-086", client: "HomeDecor", date: "10/03/2023", status: "annule" },
      { id: "EXP-2023-085", client: "ElectroTech", date: "08/03/2023", status: "en-cours" },
    ]

    return ApiResponse.success(recentExpeditions)
  } catch (error) {
    console.error("Error in GET /api/agent/dashboard/recent-expeditions:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
