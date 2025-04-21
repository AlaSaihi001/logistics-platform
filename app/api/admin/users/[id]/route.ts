import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/admin/users/[id] - Get user details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = params.id

    // Extract user type and ID from the combined ID
    const [userType, idStr] = userId.split("-")
    const id = Number.parseInt(idStr)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 })
    }

    // Get user details based on type
    let user
    let userRole

    switch (userType) {
      case "CLI":
        user = await prisma.client.findUnique({
          where: { id },
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            indicatifPaysTelephone: true,
            image: true,
            createdAt: true,
            active: true,
            // Include related data
            commandes: {
              select: {
                id: true,
                numeroCommande: true,
                dateCommande: true,
                statut: true,
              },
              take: 5,
              orderBy: { dateCommande: "desc" },
            },
            factures: {
              select: {
                id: true,
                numeroFacture: true,
                dateFacture: true,
                montant: true,
                status: true,
              },
              take: 5,
              orderBy: { dateFacture: "desc" },
            },
            reclamations: {
              select: {
                id: true,
                sujet: true,
                date: true,
                status: true,
              },
              take: 5,
              orderBy: { date: "desc" },
            },
          },
        })
        userRole = "client"
        break
      case "AGT":
        user = await prisma.agent.findUnique({
          where: { id },
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            indicatifPaysTelephone: true,
            image: true,
            createdAt: true,
            active: true,
          },
        })
        userRole = "agent"
        break
      case "AST":
        user = await prisma.assistant.findUnique({
          where: { id },
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            indicatifPaysTelephone: true,
            image: true,
            createdAt: true,
            active: true,
          },
        })
        userRole = "assistant"
        break
      case "ADM":
        user = await prisma.admin.findUnique({
          where: { id },
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            indicatifPaysTelephone: true,
            image: true,
            createdAt: true,
            active: true,
          },
        })
        userRole = "admin"
        break
      default:
        return NextResponse.json({ error: "Type d'utilisateur invalide" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Format user data
    const formattedUser = {
      id: userId,
      nom: `${user.prenom} ${user.nom}`,
      prenom: user.prenom,
      nomFamille: user.nom,
      email: user.email,
      telephone: `${user.indicatifPaysTelephone} ${user.telephone}`,
      type: userRole,
      dateInscription: new Date(user.createdAt).toLocaleDateString("fr-FR"),
      statut: user.active ? "actif" : "inactif",
      image: user.image,
      // Include related data if available
      commandes: "commandes" in user ? user.commandes : undefined,
      factures: "factures" in user ? user.factures : undefined,
      reclamations: "reclamations" in user ? user.reclamations : undefined,
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = params.id

    // Extract user type and ID from the combined ID
    const [userType, idStr] = userId.split("-")
    const id = Number.parseInt(idStr)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 })
    }

    // Check if trying to delete the current admin
    if (userType === "ADM" && id.toString() === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 })
    }

    // Check if this is the last admin
    if (userType === "ADM") {
      const adminCount = await prisma.admin.count()
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Impossible de supprimer le dernier administrateur" }, { status: 400 })
      }
    }

    // Delete user based on type
    switch (userType) {
      case "CLI":
        await prisma.client.delete({
          where: { id },
        })
        break
      case "AGT":
        await prisma.agent.delete({
          where: { id },
        })
        break
      case "AST":
        await prisma.assistant.delete({
          where: { id },
        })
        break
      case "ADM":
        await prisma.admin.delete({
          where: { id },
        })
        break
      default:
        return NextResponse.json({ error: "Type d'utilisateur invalide" }, { status: 400 })
    }

    return NextResponse.json({
      id: userId,
      message: "Utilisateur supprimé avec succès",
    })
  } catch (error) {
    console.error("Error deleting user:", error)

    // Check if this is a foreign key constraint error
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Impossible de supprimer cet utilisateur car il possède des données associées",
          details: "Vous devez d'abord supprimer ou réassigner toutes les données liées à cet utilisateur.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
