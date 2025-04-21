import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ApiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    // Simule un chargement des données
    await new Promise((resolve) => setTimeout(resolve, 700))

    const data = [
      { id: "EXP-2023-089", client: "TechGlobal", date: "15/03/2023", status: "en-cours" },
      { id: "EXP-2023-092", client: "MediPharma", date: "18/03/2023", status: "en-cours" },
      { id: "EXP-2023-095", client: "FoodExpress", date: "20/03/2023", status: "en-cours" },
      { id: "EXP-2023-098", client: "ElectroTech", date: "22/03/2023", status: "en-cours" },
    ]

    return ApiResponse.success(data)
  } catch (error) {
    console.error("Error in GET /api/agent/dashboard/urgent-expeditions:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
