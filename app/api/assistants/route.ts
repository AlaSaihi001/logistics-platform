import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { hash } from "bcrypt"
import { rateLimiter } from "@/lib/rate-limiter"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const assistant = await prisma.assistant.findUnique({
      where: { id: Number(user.id) },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        image: true,
        indicatifPaysTelephone: true,
        telephone: true,
      },
    })

    if (!assistant) {
      return Response.json({ error: "Assistant non trouvé" }, { status: 404 })
    }

    return Response.json(assistant)
  } catch (error) {
    console.error("Error fetching assistant:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(req); // Vérifie si l'IP est limitée
    if (rateLimitResponse) return rateLimitResponse; // Si l'IP est limitée, on renvoie la réponse de limitation

    const body = await req.json(); // Récupérer le corps de la requête (l'assistant à créer)

    // Vérifier si un assistant avec ce même email existe déjà
    const existingAssistant = await prisma.assistant.findUnique({
      where: { email: body.email },
    });

    if (existingAssistant) {
      return Response.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    // Hachage du mot de passe avant de le sauvegarder
    const hashedPassword = await hash(body.motDePasse, 10); // 10 est le "salt rounds"

    // Créer un nouvel assistant dans la base de données
    const newAssistant = await prisma.assistant.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        indicatifPaysTelephone: body.indicatifPaysTelephone,
        telephone: Number.parseInt(body.telephone),
        motDePasse: hashedPassword,
        image: body.image || null,
      },
    });

    // Ne pas inclure le mot de passe dans la réponse
    const { motDePasse, ...assistantWithoutPassword } = newAssistant;

    // Retourner la réponse avec les données de l'assistant créé
    return Response.json(assistantWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'assistant:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()

    const updatedAssistant = await prisma.assistant.update({
      where: { id: Number(user.id) },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        indicatifPaysTelephone: body.indicatifPaysTelephone,
        telephone: Number.parseInt(body.telephone),
        image: body.image,
      },
    })

    const { motDePasse, ...assistantWithoutPassword } = updatedAssistant

    return Response.json(assistantWithoutPassword)
  } catch (error) {
    console.error("Error updating assistant:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
