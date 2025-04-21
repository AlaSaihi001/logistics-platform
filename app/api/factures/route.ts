import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const statusFilter = req.nextUrl.searchParams.get("status")

    let factures

    if (role === "CLIENT") {
      // Client can only see their own invoices
      const whereClause: any = { idClient: userId }

      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") }
      }

      factures = await prisma.facture.findMany({
        where: whereClause,
        include: {
          commande: true,
          paiement: true,
        },
        orderBy: { dateEmission: "desc" },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see all invoices or invoices assigned to them
      const whereClause: any = {}

      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") }
      }

      factures = await prisma.facture.findMany({
        where: whereClause,
        include: {
          commande: true,
          paiement: true,
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
        orderBy: { dateEmission: "desc" },
      })
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }

    return Response.json(factures)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const assistantId = Number.parseInt(session.user.id)
    const body = await req.json()

    // Missing validation for required fields
    // Recommended fix: Add validation
    if (!body.idCommande || !body.montant) {
      return Response.json(
        {
          error: "Données manquantes",
          details: "L'ID de commande et le montant sont requis",
        },
        { status: 400 },
      )
    }

    // Validate montant is a positive number
    const montant = Number.parseFloat(body.montant)
    if (isNaN(montant) || montant <= 0) {
      return Response.json(
        {
          error: "Montant invalide",
          details: "Le montant doit être un nombre positif",
        },
        { status: 400 },
      )
    }

    // Check if the order exists
    const order = await prisma.commande.findUnique({
      where: { id: Number.parseInt(body.idCommande) },
    })

    if (!order) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Generate invoice number (simple implementation)
    const lastInvoice = await prisma.facture.findFirst({
      orderBy: { numeroFacture: "desc" },
    })

    const nextInvoiceNumber = lastInvoice ? lastInvoice.numeroFacture + 1 : 1000

    // Create new invoice
    const newInvoice = await prisma.facture.create({
      data: {
        idCommande: Number.parseInt(body.idCommande),
        idClient: order.clientId,
        idAgent: assistantId,
        document: body.document || null,
        numeroFacture: nextInvoiceNumber,
        montant: Number.parseFloat(body.montant),
        dateEmission: new Date(),
        status: "En attente",
      },
      include: {
        commande: true,
      },
    })

    // Create notification for the client
    await prisma.notification.create({
      data: {
        type: "facture",
        correspond: `Une nouvelle facture #${newInvoice.numeroFacture} a été créée pour votre commande ${order.nom}.`,
        lu: false,
        clientId: order.clientId,
      },
    })

    return Response.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()

    // Update invoice
    const updatedInvoice = await prisma.facture.update({
      where: { id: Number.parseInt(body.id) },
      data: {
        status: body.status,
        document: body.document || undefined,
      },
      include: {
        commande: true,
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
    await prisma.notification.create({
      data: {
        type: "facture",
        correspond: `Le statut de votre facture #${updatedInvoice.numeroFacture} a été mis à jour: ${updatedInvoice.status}.`,
        lu: false,
        clientId: updatedInvoice.idClient,
      },
    })

    return Response.json(updatedInvoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
