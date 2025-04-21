import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { getAssistantProfile, updateAssistantProfile } from "@/lib/assistant-service"

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
    const assistant = await getAssistantProfile(assistantId)

    if (!assistant) {
      return NextResponse.json({ error: "Assistant non trouvé" }, { status: 404 })
    }

    return NextResponse.json(assistant)
  } catch (error) {
    console.error("Error fetching assistant profile:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération du profil" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const data = await request.json()
    const assistantId = Number.parseInt(user.id)
    const updatedAssistant = await updateAssistantProfile(assistantId, data)

    return NextResponse.json(updatedAssistant)
  } catch (error) {
    console.error("Error updating assistant profile:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour du profil" }, { status: 500 })
  }
}
