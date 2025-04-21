import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ClientService } from "@/lib/client-service"

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const body = await req.json()

    // Champs requis
    if (!body.currentPassword || !body.newPassword) {
      return Response.json(
        {
          error: "Données manquantes",
          details: "Le mot de passe actuel et le nouveau mot de passe sont requis",
        },
        { status: 400 }
      )
    }

    // Sécurité minimale du mot de passe
    if (body.newPassword.length < 8) {
      return Response.json(
        {
          error: "Mot de passe invalide",
          details: "Le mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      )
    }

    // Mise à jour du mot de passe via le service
    await ClientService.modifierMotDePasse(clientId, body.currentPassword, body.newPassword)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error)

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
