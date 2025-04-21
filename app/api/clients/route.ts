import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/jwt-utils" // Utilisation du JWT
import { hash } from "bcrypt"
import { rateLimiter } from "@/lib/rate-limiter"

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'utilisateur via JWT
    const user = await getUserFromToken(req)

    // Validation du rôle de l'utilisateur
    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(user.id)

    // Récupérer les informations du client depuis Prisma
    const client = await prisma.client.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        image: true,
        indicatifPaysTelephone: true,
        telephone: true,
        // Exclure le mot de passe
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Appliquer la limitation des requêtes basées sur l'IP
    const ip = req.ip ?? "127.0.0.1"

    // Utiliser le rateLimiter
    const { success, limit, reset, remaining } = await rateLimiter(
      req,
      ip, // Identifiant : l'IP
      5, // Limite par défaut (par exemple 5 requêtes)
      60 // Fenêtre par défaut (par exemple 60 secondes)
    )

    // Vérifier si le succès de la limitation est true
    if (!success) {
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez réessayer plus tard." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      )
    }

    const body = await req.json()

    // Vérification si l'email existe déjà
    const existingClient = await prisma.client.findUnique({
      where: { email: body.email },
    })

    if (existingClient) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 })
    }

    // Hachage du mot de passe
    const hashedPassword = await hash(body.motDePasse, 10)

    // Créer un nouveau client
    const newClient = await prisma.client.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        indicatifPaysTelephone: body.indicatifPaysTelephone,
        telephone: Number.parseInt(body.telephone),
        motDePasse: hashedPassword,
        image: body.image || null,
      },
    })

    // Exclure le mot de passe de la réponse
    const { motDePasse, ...clientWithoutPassword } = newClient

    return NextResponse.json(clientWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Récupérer l'utilisateur via JWT
    const user = await getUserFromToken(req)

    // Validation du rôle de l'utilisateur
    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(user.id)
    const body = await req.json()

    // Mettre à jour le client
    const updatedClient = await prisma.client.update({
      where: { id: userId },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        indicatifPaysTelephone: body.indicatifPaysTelephone,
        telephone: Number.parseInt(body.telephone),
        image: body.image,
      },
    })

    // Exclure le mot de passe de la réponse
    const { motDePasse, ...clientWithoutPassword } = updatedClient

    return NextResponse.json(clientWithoutPassword)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
