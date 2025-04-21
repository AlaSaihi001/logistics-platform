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
    const orderId = Number.parseInt(params.id)

    let commande

    if (role === "CLIENT") {
      // Client can only see their own orders
      commande = await prisma.commande.findFirst({
        where: {
          id: orderId,
          clientId: userId,
        },
        include: {
          produits: true,
          factures: true,
        },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see all orders
      commande = await prisma.commande.findUnique({
        where: {
          id: orderId,
        },
        include: {
          produits: true,
          factures: true,
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
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }

    if (!commande) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Add cache control headers
    return new Response(JSON.stringify(commande), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error fetching order:", error)
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
    const orderId = Number.parseInt(params.id)
    const body = await req.json()

    // Check if the order exists
    const existingOrder = await prisma.commande.findUnique({
      where: { id: orderId },
    })

    if (!existingOrder) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Different update logic based on role
    if (role === "CLIENT") {
      // Client can only update their own orders and only if they are in "En attente" status
      const clientId = Number.parseInt(session.user.id)

      if (existingOrder.clientId !== clientId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 })
      }

      if (existingOrder.status !== "En attente") {
        return Response.json({ error: "Impossible de modifier une commande qui n'est pas en attente" }, { status: 400 })
      }

      // Update order
      const updatedOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          nom: body.nom,
          pays: body.pays,
          adresse: body.adresse,
          dateDePickup: new Date(body.dateDePickup),
          valeurMarchandise: Number.parseFloat(body.valeurMarchandise),
          typeCommande: body.typeCommande,
          typeTransport: body.typeTransport,
          ecoterme: body.ecoterme,
          modePaiement: body.modePaiement,
          nomDestinataire: body.nomDestinataire,
          paysDestinataire: body.paysDestinataire,
          adresseDestinataire: body.adresseDestinataire,
          indicatifTelephoneDestinataire: body.indicatifTelephoneDestinataire,
          telephoneDestinataire: Number.parseInt(body.telephoneDestinataire),
          emailDestinataire: body.emailDestinataire,
        },
        include: {
          produits: true,
        },
      })

      return Response.json(updatedOrder)
    } else if (role === "ASSISTANT") {
      // Assistant can update order status and assign themselves
      const assistantId = Number.parseInt(session.user.id)

      // Update order
      const updatedOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          status: body.status || existingOrder.status,
          assistantId: body.assignToMe ? assistantId : existingOrder.assistantId,
          adresseActuel: body.adresseActuel || existingOrder.adresseActuel,
        },
        include: {
          produits: true,
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
      if (body.status && body.status !== existingOrder.status) {
        await prisma.notification.create({
          data: {
            type: "statut",
            correspond: `Le statut de votre commande ${updatedOrder.nom} a été mis à jour: ${updatedOrder.status}.`,
            lu: false,
            clientId: updatedOrder.clientId,
          },
        })
      }

      return Response.json(updatedOrder)
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }
  } catch (error) {
    console.error("Error updating order:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const orderId = Number.parseInt(params.id)

    // Check if the order exists
    const existingOrder = await prisma.commande.findUnique({
      where: { id: orderId },
      include: { produits: true },
    })

    if (!existingOrder) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    if (role === "CLIENT") {
      // Client can only cancel their own orders and only if they are in "En attente" status
      if (existingOrder.clientId !== userId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 })
      }

      if (existingOrder.status !== "En attente") {
        return Response.json({ error: "Impossible d'annuler une commande qui n'est pas en attente" }, { status: 400 })
      }

      // Update order status to "Annulée"
      const cancelledOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          status: "Annulée",
        },
      })

      // Create notification for the client
      await prisma.notification.create({
        data: {
          type: "commande",
          correspond: `Votre commande ${cancelledOrder.nom} a été annulée.`,
          lu: false,
          clientId: userId,
        },
      })

      return Response.json(cancelledOrder)
    } else if (role === "ASSISTANT") {
      // Assistant can reject orders
      // Update order status to "Refusée"
      const rejectedOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          status: "Refusée",
          assistantId: userId,
        },
      })

      // Create notification for the client
      await prisma.notification.create({
        data: {
          type: "commande",
          correspond: `Votre commande ${rejectedOrder.nom} a été refusée par l'assistant.`,
          lu: false,
          clientId: rejectedOrder.clientId,
        },
      })

      return Response.json(rejectedOrder)
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }
  } catch (error) {
    console.error("Error cancelling order:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
