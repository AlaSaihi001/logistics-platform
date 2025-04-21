import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const reclamationId = Number.parseInt(params.id)

    let reclamation

    if (role === "CLIENT") {
      // Client can only see their own claims
      reclamation = await prisma.reclamation.findFirst({
        where: {
          id: reclamationId,
          idClient: userId,
        },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see all claims
      reclamation = await prisma.reclamation.findUnique({
        where: {
          id: reclamationId,
        },
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              indicatifPaysTelephone: true,
              telephone: true,
            },
          },
        },
      })
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }

    if (!reclamation) {
      return Response.json({ error: "Réclamation non trouvée" }, { status: 404 })
    }

    // Parse documents JSON if it exists
    if (reclamation.documents) {
      reclamation.documents = JSON.parse(reclamation.documents)
    }

    return Response.json(reclamation)
  } catch (error) {
    console.error("Error fetching claim:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
