import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/admin/payment-methods/[id] - Get payment method details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de méthode de paiement invalide" }, { status: 400 })
    }

    // Get payment method from database
    const method = await prisma.methodePaiement.findUnique({
      where: { id },
    })

    if (!method) {
      return NextResponse.json({ error: "Méthode de paiement non trouvée" }, { status: 404 })
    }

    // Format response
    const formattedMethod = {
      id: method.id.toString(),
      nom: method.nom,
      description: method.description || "",
      frais: `${method.fraisPourcentage}%`,
      fraisFixe: `${method.fraisFixe.toFixed(2)} €`,
      statut: method.actif ? "actif" : "inactif",
      dateCreation: new Date(method.createdAt).toLocaleDateString("fr-FR"),
      derniereMaj: new Date(method.updatedAt).toLocaleDateString("fr-FR"),
    }

    return NextResponse.json(formattedMethod)
  } catch (error) {
    console.error("Error fetching payment method:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT /api/admin/payment-methods/[id] - Update a payment method
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de méthode de paiement invalide" }, { status: 400 })
    }

    const body = await req.json()
    const { nom, description, frais, fraisFixe, statut } = body

    // Validate required fields
    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
    }

    // Parse frais and fraisFixe
    const fraisPourcentage = Number.parseFloat(frais.replace("%", ""))
    const fraisFixeValue = Number.parseFloat(fraisFixe.replace("€", ""))

    if (isNaN(fraisPourcentage) || isNaN(fraisFixeValue)) {
      return NextResponse.json({ error: "Les frais doivent être des nombres valides" }, { status: 400 })
    }

    // Update payment method
    const updatedMethod = await prisma.methodePaiement.update({
      where: { id },
      data: {
        nom,
        description,
        fraisPourcentage,
        fraisFixe: fraisFixeValue,
        actif: statut === "actif",
      },
    })

    // Format response
    const formattedMethod = {
      id: updatedMethod.id.toString(),
      nom: updatedMethod.nom,
      description: updatedMethod.description || "",
      frais: `${updatedMethod.fraisPourcentage}%`,
      fraisFixe: `${updatedMethod.fraisFixe.toFixed(2)} €`,
      statut: updatedMethod.actif ? "actif" : "inactif",
      dateCreation: new Date(updatedMethod.createdAt).toLocaleDateString("fr-FR"),
      derniereMaj: new Date(updatedMethod.updatedAt).toLocaleDateString("fr-FR"),
    }

    return NextResponse.json(formattedMethod)
  } catch (error) {
    console.error("Error updating payment method:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE /api/admin/payment-methods/[id] - Delete a payment method
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de méthode de paiement invalide" }, { status: 400 })
    }

    // Check if the payment method is used in any transactions
    const transactionsCount = await prisma.paiement.count({
      where: { idMethodePaiement: id },
    })

    if (transactionsCount > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer cette méthode de paiement",
          details:
            "Cette méthode est utilisée dans des transactions existantes. Désactivez-la plutôt que de la supprimer.",
        },
        { status: 400 },
      )
    }

    // Delete payment method
    await prisma.methodePaiement.delete({
      where: { id },
    })

    return NextResponse.json({
      id: id.toString(),
      message: "Méthode de paiement supprimée avec succès",
    })
  } catch (error) {
    console.error("Error deleting payment method:", error)

    // Check if this is a foreign key constraint error
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Impossible de supprimer cette méthode de paiement",
          details: "Cette méthode est référencée par d'autres données dans le système.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
