import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { ClientService } from "@/lib/client-service"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const statusFilter = req.nextUrl.searchParams.get("status")

    let paiements

    if (statusFilter) {
      // Filtrer par statut
      paiements = await prisma.paiement.findMany({
        where: {
          clientId: clientId,
          statut: { in: statusFilter.split(",") },
        },
        include: {
          facture: {
            include: {
              commande: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Tous les paiements
      paiements = await ClientService.gererPaiements(clientId)
    }

    return Response.json(paiements)
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const body = await req.json()

    // Vérifie si la facture existe
    const invoice = await prisma.facture.findUnique({
      where: { id: Number.parseInt(body.idFacture) },
    })

    if (!invoice) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    // Vérifie que la facture appartient bien au client
    if (invoice.idClient !== clientId) {
      return Response.json({ error: "Non autorisé" }, { status: 403 })
    }

    if (invoice.status === "Payée") {
      return Response.json({ error: "Cette facture a déjà été payée" }, { status: 400 })
    }

    const existingPayment = await prisma.paiement.findUnique({
      where: { idFacture: Number.parseInt(body.idFacture) },
    })

    if (existingPayment) {
      return Response.json({ error: "Un paiement existe déjà pour cette facture" }, { status: 400 })
    }

    // Créer le paiement
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

    // Mettre à jour le statut de la facture
    await prisma.facture.update({
      where: { id: Number.parseInt(body.idFacture) },
      data: {
        status: "En cours de paiement",
      },
    })

    // Créer une notification
    await prisma.notification.create({
      data: {
        type: "paiement",
        correspond: `Votre paiement pour la facture #${invoice.numeroFacture} a été initié.`,
        lu: false,
        clientId: clientId,
      },
    })

    return Response.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du paiement:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
