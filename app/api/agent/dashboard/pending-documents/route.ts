import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ApiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized()
    }

    // Simuler une légère latence (ex : pour affichage de loading spinner)
    await new Promise((resolve) => setTimeout(resolve, 600))

    // 👉 À remplacer par une vraie récupération de données via service ou Prisma
    const mockDocuments = [
      { id: "DOC-2023-045", type: "Certificat d'origine", expedition: "EXP-2023-089", status: "a-valider" },
      { id: "DOC-2023-046", type: "Facture commerciale", expedition: "EXP-2023-092", status: "a-valider" },
      { id: "DOC-2023-047", type: "Certificat sanitaire", expedition: "EXP-2023-095", status: "a-valider" },
      { id: "DOC-2023-048", type: "Déclaration d'exportation", expedition: "EXP-2023-098", status: "a-valider" },
    ]

    return ApiResponse.success(mockDocuments)
  } catch (error) {
    console.error("Error in GET /api/agent/dashboard/pending-documents:", error)
    return ApiResponse.serverError("Une erreur est survenue")
  }
}
