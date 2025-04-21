import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { updateAssistantPassword } from "@/lib/assistant-service"

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis" },
        { status: 400 }
      )
    }

    const assistantId = Number.parseInt(user.id)
    await updateAssistantPassword(assistantId, currentPassword, newPassword)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating assistant password:", error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la mise à jour du mot de passe" },
      { status: 500 }
    )
  }
}
