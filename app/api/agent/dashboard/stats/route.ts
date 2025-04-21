import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ApiResponse } from "@/lib/api-response"

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    const { dateFrom, dateTo } = await req.json()

    // Simule une requête lente
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Données fictives, à remplacer par des stats réelles depuis ta DB
    const stats = {
      expeditionsEnCours: 14,
      documentsAValider: 9,
      facturesAEnvoyer: 6,
      expeditionsUrgentes: 4,
      expeditionsTrend: { value: 10, isPositive: true },
      documentsTrend: { value: 5, isPositive: false },
      facturesTrend: { value: 8, isPositive: true },
      urgentesTrend: { value: 1, isPositive: false },
    }

    return ApiResponse.success(stats)
  } catch (error) {
    console.error("Error in POST /api/agent/dashboard/stats:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
