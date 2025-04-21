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

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de méthode de paiement invalide" }, { status: 400 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || (status !== "actif" && status !== "inactif")) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // If deactivating, check if this is the last active payment method
    if (status === "inactif") {
      const activeMethodsCount = await prisma.methodePaiement.count({
        where: { actif: true },
      })

      if (activeMethodsCount <= 1) {
        const currentMethod = await prisma.methodePaiement.findUnique({
          where: { id },
          select: { actif: true },
        })

        if (currentMethod?.actif) {
          return NextResponse.json(
            { error: "Impossible de désactiver la dernière méthode de paiement active" },
            { status: 400 },
          )
        }
      }
    }

    // Update payment method status
    const updatedMethod = await prisma.methodePaiement.update({
      where: { id },
      data: {
        actif: status === "actif",
      },
    })

    return NextResponse.json({
      id: updatedMethod.id.toString(),
      status,
      message: `Méthode de paiement ${status === "actif" ? "activée" : "désactivée"} avec succès`,
    })
  } catch (error) {
    console.error("Error updating payment method status:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
