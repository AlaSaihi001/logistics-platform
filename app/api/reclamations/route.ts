import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeHtml } from "@/lib/sanitize"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const statusFilter = req.nextUrl.searchParams.get("status")

    let reclamations

    if (role === "CLIENT") {
      // Client can only see their own claims
      const whereClause: any = { idClient: userId }

      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") }
      }

      reclamations = await prisma.reclamation.findMany({
        where: whereClause,
        orderBy: { date: "desc" },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see all claims or claims assigned to them
      const whereClause: any = {}

      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") }
      }

      reclamations = await prisma.reclamation.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
        orderBy: { date: "desc" },
      })
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }

    return Response.json(reclamations)
  } catch (error) {
    console.error("Error fetching claims:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(session.user.id)
    const body = await req.json()

    // Create new claim with sanitized input
    const newClaim = await prisma.reclamation.create({
      data: {
        idClient: clientId,
        sujet: sanitizeHtml(body.sujet),
        description: sanitizeHtml(body.description),
        documents: body.documents
          ? JSON.stringify(
              body.documents.map((doc) => ({
                ...doc,
                name: sanitizeHtml(doc.name),
              })),
            )
          : null,
        status: "Ouverte",
        date: new Date(),
      },
    })

    // Create notification for assistants
    await prisma.notification.create({
      data: {
        type: "reclamation",
        correspond: `Une nouvelle réclamation a été créée: ${newClaim.sujet}.`,
        lu: false,
        // Send to all assistants (in a real app, you might want to send to specific assistants)
        // For now, we'll leave assistantId as null and handle this in the frontend
      },
    })

    return Response.json(newClaim, { status: 201 })
  } catch (error) {
    console.error("Error creating claim:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const body = await req.json()

    // Check if the claim exists
    const existingClaim = await prisma.reclamation.findUnique({
      where: { id: Number.parseInt(body.id) },
    })

    if (!existingClaim) {
      return Response.json({ error: "Réclamation non trouvée" }, { status: 404 })
    }

    if (role === "CLIENT") {
      // Client can only update their own claims
      if (existingClaim.idClient !== userId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 })
      }

      // Client can only update the description and documents
      const updatedClaim = await prisma.reclamation.update({
        where: { id: Number.parseInt(body.id) },
        data: {
          description: body.description || existingClaim.description,
          documents: body.documents ? JSON.stringify(body.documents) : existingClaim.documents,
        },
      })

      return Response.json(updatedClaim)
    } else if (role === "ASSISTANT") {
      // Assistant can update claim status and assign themselves
      const updatedClaim = await prisma.reclamation.update({
        where: { id: Number.parseInt(body.id) },
        data: {
          status: body.status || existingClaim.status,
          assistantId: body.assignToMe ? userId : existingClaim.assistantId,
        },
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      })

      // Create notification for the client
      if (body.status && body.status !== existingClaim.status) {
        await prisma.notification.create({
          data: {
            type: "reclamation",
            correspond: `Le statut de votre réclamation "${updatedClaim.sujet}" a été mis à jour: ${updatedClaim.status}.`,
            lu: false,
            clientId: updatedClaim.idClient,
          },
        })
      }

      return Response.json(updatedClaim)
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }
  } catch (error) {
    console.error("Error updating claim:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
