import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/admin/payment-methods - Get all payment methods
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get payment methods from database
    const paymentMethods = await prisma.methodePaiement.findMany({
      orderBy: { createdAt: "desc" },
    })

    // Format payment methods
    const formattedMethods = paymentMethods.map((method) => ({
      id: method.id.toString(),
      nom: method.nom,
      description: method.description || "",
      frais: `${method.fraisPourcentage}%`,
      fraisFixe: `${method.fraisFixe.toFixed(2)} €`,
      statut: method.actif ? "actif" : "inactif",
      dateCreation: new Date(method.createdAt).toLocaleDateString("fr-FR"),
      derniereMaj: new Date(method.updatedAt).toLocaleDateString("fr-FR"),
    }))

    return NextResponse.json(formattedMethods)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/admin/payment-methods - Create a new payment method
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
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

    // Create new payment method
    const newMethod = await prisma.methodePaiement.create({
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
      id: newMethod.id.toString(),
      nom: newMethod.nom,
      description: newMethod.description || "",
      frais: `${newMethod.fraisPourcentage}%`,
      fraisFixe: `${newMethod.fraisFixe.toFixed(2)} €`,
      statut: newMethod.actif ? "actif" : "inactif",
      dateCreation: new Date(newMethod.createdAt).toLocaleDateString("fr-FR"),
      derniereMaj: new Date(newMethod.updatedAt).toLocaleDateString("fr-FR"),
    }

    return NextResponse.json(formattedMethod, { status: 201 })
  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
