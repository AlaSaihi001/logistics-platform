import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ClientService } from "@/lib/client-service"
import { getUserFromToken } from "@/lib/jwt-utils"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)

    // Use the ClientService to get profile
    const profile = await ClientService.gererProfil(clientId)

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const body = await req.json()

    // Update client profile without modifying the email
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        indicatifPaysTelephone: body.indicatifPaysTelephone,
        telephone: Number.parseInt(body.telephone),
        image: body.image,
        // The email is not included here, so it won't be updated
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true, // The email is still selected but not updated
        indicatifPaysTelephone: true,
        telephone: true,
        image: true,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

