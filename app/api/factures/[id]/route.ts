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
    const factureId = Number.parseInt(params.id)

    let facture

    if (role === "CLIENT") {
      // Client can only see their own invoices
      facture = await prisma.facture.findFirst({
        where: {
          id: factureId,
          idClient: userId,
        },
        include: {
          commande: {
            include: {
              produits: true,
            },
          },
          paiement: true,
        },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see all invoices
      facture = await prisma.facture.findUnique({
        where: {
          id: factureId,
        },
        include: {
          commande: {
            include: {
              produits: true,
            },
          },
          paiement: true,
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

    if (!facture) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    return Response.json(facture)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const role = session.user.role
    const factureId = Number.parseInt(params.id)
    const body = await req.json()

    // Check if the invoice exists
    const existingInvoice = await prisma.facture.findUnique({
      where: { id: factureId },
    })

    if (!existingInvoice) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    if (role === "ASSISTANT") {
      // Assistant can update invoice status
      const updatedInvoice = await prisma.facture.update({
        where: { id: factureId },
        data: {
          status: body.status || existingInvoice.status,
          document: body.document || existingInvoice.document,
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
      if (body.status && body.status !== existingInvoice.status) {
        await prisma.notification.create({
          data: {
            type: "facture",
            correspond: `Le statut de votre facture #${updatedInvoice.numeroFacture} a été mis à jour: ${updatedInvoice.status}.`,
            lu: false,
            clientId: updatedInvoice.idClient,
          },
        })
      }

      return Response.json(updatedInvoice)
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }
  } catch (error) {
    console.error("Error updating invoice:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
