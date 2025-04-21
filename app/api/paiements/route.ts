import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const statusFilter = req.nextUrl.searchParams.get("status")

    let paiements

    if (role === "CLIENT") {
      // Client can only see their own payments
      const whereClause: any = { clientId: userId }

      if (statusFilter) {
        whereClause.statut = { in: statusFilter.split(",") }
      }

      paiements = await prisma.paiement.findMany({
        where: whereClause,
        include: {
          facture: {
            include: {
              commande: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see all payments
      const whereClause: any = {}

      if (statusFilter) {
        whereClause.statut = { in: statusFilter.split(",") }
      }

      paiements = await prisma.paiement.findMany({
        where: whereClause,
        include: {
          facture: {
            include: {
              commande: true,
            },
          },
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }

    return Response.json(paiements)
  } catch (error) {
    console.error("Error fetching payments:", error)
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

    // Check if the invoice exists
    const invoice = await prisma.facture.findUnique({
      where: { id: Number.parseInt(body.idFacture) },
    })

    if (!invoice) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    // Check if the invoice belongs to the client
    if (invoice.idClient !== clientId) {
      return Response.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Check if the invoice is already paid
    if (invoice.status === "Payée") {
      return Response.json({ error: "Cette facture a déjà été payée" }, { status: 400 })
    }

    // Check if there's already a payment for this invoice
    const existingPayment = await prisma.paiement.findUnique({
      where: { idFacture: Number.parseInt(body.idFacture) },
    })

    if (existingPayment) {
      return Response.json({ error: "Un paiement existe déjà pour cette facture" }, { status: 400 })
    }

    // Create new payment
    const newPayment = await prisma.paiement.create({
      data: {
        idFacture: Number.parseInt(body.idFacture),
        modePaiement: body.modePaiement,
        statut: "En attente",
        montant: invoice.montant,
        clientId: clientId,
      },
      include: {
        facture: true,
      },
    })

    // Update invoice status
    await prisma.facture.update({
      where: { id: Number.parseInt(body.idFacture) },
      data: {
        status: "En cours de paiement",
      },
    })

    // Create notification for the client
    await prisma.notification.create({
      data: {
        type: "paiement",
        correspond: `Votre paiement pour la facture #${invoice.numeroFacture} a été initié.`,
        lu: false,
        clientId: clientId,
      },
    })

    // Create notification for assistants
    if (invoice.idAgent) {
      await prisma.notification.create({
        data: {
          type: "paiement",
          correspond: `Un paiement a été initié pour la facture #${invoice.numeroFacture}.`,
          lu: false,
          assistantId: invoice.idAgent,
        },
      })
    }

    return Response.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)

    // More detailed error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json(
          {
            error: "Conflit de données",
            details: "Un paiement existe déjà pour cette facture",
          },
          { status: 409 },
        )
      }
      if (error.code === "P2003") {
        return Response.json(
          {
            error: "Référence invalide",
            details: "La facture référencée n'existe pas",
          },
          { status: 400 },
        )
      }
    }

    return Response.json(
      {
        error: "Erreur serveur",
        details: "Une erreur est survenue lors du traitement de votre demande",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()

    // Update payment
    const updatedPayment = await prisma.paiement.update({
      where: { id: Number.parseInt(body.id) },
      data: {
        statut: body.statut,
        datePaiement: body.statut === "Payé" ? new Date() : null,
      },
      include: {
        facture: true,
      },
    })

    // If payment is confirmed, update invoice status
    if (body.statut === "Payé") {
      await prisma.facture.update({
        where: { id: updatedPayment.idFacture },
        data: {
          status: "Payée",
        },
      })

      // Create notification for the client
      await prisma.notification.create({
        data: {
          type: "paiement",
          correspond: `Votre paiement pour la facture #${updatedPayment.facture.numeroFacture} a été confirmé.`,
          lu: false,
          clientId: updatedPayment.clientId,
        },
      })
    } else if (body.statut === "Refusé") {
      // If payment is refused, update invoice status back to "En attente"
      await prisma.facture.update({
        where: { id: updatedPayment.idFacture },
        data: {
          status: "En attente",
        },
      })

      // Create notification for the client
      await prisma.notification.create({
        data: {
          type: "paiement",
          correspond: `Votre paiement pour la facture #${updatedPayment.facture.numeroFacture} a été refusé.`,
          lu: false,
          clientId: updatedPayment.clientId,
        },
      })
    }

    return Response.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
