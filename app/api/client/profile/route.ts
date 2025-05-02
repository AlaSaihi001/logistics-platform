import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ClientService } from "@/lib/client-service"
import { getUserFromToken } from "@/lib/jwt-utils"
import bcrypt from "bcryptjs"

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

export async function PUT_PASSWORD(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const { currentPassword, newPassword } = await req.json()

    // Fetch the user from the database
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    // Check if the current password is correct
    const passwordMatch = await bcrypt.compare(currentPassword, client.motDePasse)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password
    await prisma.client.update({
      where: { id: clientId },
      data: { motDePasse: hashedPassword },
    })

    return NextResponse.json({ message: "Mot de passe mis à jour avec succès" })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)

    // Delete the client account
    await prisma.client.delete({
      where: { id: clientId },
    })

    return NextResponse.json({ message: "Compte supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
