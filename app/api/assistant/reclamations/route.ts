import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { getAssistantReclamations } from "@/lib/assistant-service"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const assistantId = Number.parseInt(user.id)
    const reclamations = await getAssistantReclamations(assistantId)

    return NextResponse.json(reclamations)
  } catch (error) {
    console.error("Error fetching assistant reclamations:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des réclamations" },
      { status: 500 }
    )
  }
}
