import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = params.id
    const body = await req.json()
    const { status } = body

    if (!status || (status !== "actif" && status !== "inactif")) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Extract user type and ID from the combined ID
    const [userType, idStr] = userId.split("-")
    const id = Number.parseInt(idStr)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 })
    }

    // Update user status based on type
    let updatedUser
    const isActive = status === "actif"

    switch (userType) {
      case "CLI":
        updatedUser = await prisma.client.update({
          where: { id },
          data: { active: isActive },
        })
        break
      case "AGT":
        updatedUser = await prisma.agent.update({
          where: { id },
          data: { active: isActive },
        })
        break
      case "AST":
        updatedUser = await prisma.assistant.update({
          where: { id },
          data: { active: isActive },
        })
        break
      case "ADM":
        // Prevent deactivating the last active admin
        if (!isActive) {
          const activeAdmins = await prisma.admin.count({
            where: { active: true },
          })
          if (activeAdmins <= 1) {
            return NextResponse.json(
              { error: "Impossible de désactiver le dernier administrateur actif" },
              { status: 400 },
            )
          }
        }
        updatedUser = await prisma.admin.update({
          where: { id },
          data: { active: isActive },
        })
        break
      default:
        return NextResponse.json({ error: "Type d'utilisateur invalide" }, { status: 400 })
    }

    return NextResponse.json({
      id: userId,
      status,
      message: `Utilisateur ${status === "actif" ? "activé" : "désactivé"} avec succès`,
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
