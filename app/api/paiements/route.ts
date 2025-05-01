import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const statusFilter = req.nextUrl.searchParams.get("status");

    let paiements;

    if (role === "CLIENT") {
      const whereClause: any = { clientId: userId };

      if (statusFilter) {
        whereClause.statut = { in: statusFilter.split(",") };
      }

      paiements = await prisma.paiement.findMany({
        where: whereClause,
        include: {
          facture: {
            include: { commande: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "ASSISTANT") {
      const whereClause: any = {};

      if (statusFilter) {
        whereClause.statut = { in: statusFilter.split(",") };
      }

      paiements = await prisma.paiement.findMany({
        where: whereClause,
        include: {
          facture: {
            include: { commande: true },
          },
          client: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    return Response.json(paiements);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const clientId = Number.parseInt(user.id);
    const body = await req.json();

    const invoice = await prisma.facture.findUnique({
      where: { id: Number.parseInt(body.idFacture) },
    });

    if (!invoice) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    if (invoice.idClient !== clientId) {
      return Response.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (invoice.status === "Payée") {
      return Response.json({ error: "Cette facture a déjà été payée" }, { status: 400 });
    }

    const existingPayment = await prisma.paiement.findUnique({
      where: { idFacture: Number.parseInt(body.idFacture) },
    });

    if (existingPayment) {
      return Response.json({ error: "Un paiement existe déjà pour cette facture" }, { status: 400 });
    }

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
    });

    await prisma.facture.update({
      where: { id: Number.parseInt(body.idFacture) },
      data: {
        status: "En cours de paiement",
      },
    });

    await prisma.notification.create({
      data: {
        type: "paiement",
        correspond: `Votre paiement pour la facture #${invoice.numeroFacture} a été initié.`,
        lu: false,
        clientId: clientId,
      },
    });

    if (invoice.idAgent) {
      await prisma.notification.create({
        data: {
          type: "paiement",
          correspond: `Un paiement a été initié pour la facture #${invoice.numeroFacture}.`,
          lu: false,
          assistantId: invoice.idAgent,
        },
      });
    }

    return Response.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json({ error: "Conflit de données", details: "Un paiement existe déjà pour cette facture" }, { status: 409 });
      }
      if (error.code === "P2003") {
        return Response.json({ error: "Référence invalide", details: "La facture référencée n'existe pas" }, { status: 400 });
      }
    }

    return Response.json({ error: "Erreur serveur", details: "Une erreur est survenue lors du traitement de votre demande" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    const updatedPayment = await prisma.paiement.update({
      where: { id: Number.parseInt(body.id) },
      data: {
        statut: body.statut,
        datePaiement: body.statut === "Payé" ? new Date() : null,
      },
      include: {
        facture: true,
      },
    });

    if (body.statut === "Payé") {
      await prisma.facture.update({
        where: { id: updatedPayment.idFacture },
        data: {
          status: "Payée",
        },
      });

      await prisma.notification.create({
        data: {
          type: "paiement",
          correspond: `Votre paiement pour la facture #${updatedPayment.facture.numeroFacture} a été confirmé.`,
          lu: false,
          clientId: updatedPayment.clientId,
        },
      });
    } else if (body.statut === "Refusé") {
      await prisma.facture.update({
        where: { id: updatedPayment.idFacture },
        data: {
          status: "En attente",
        },
      });

      await prisma.notification.create({
        data: {
          type: "paiement",
          correspond: `Votre paiement pour la facture #${updatedPayment.facture.numeroFacture} a été refusé.`,
          lu: false,
          clientId: updatedPayment.clientId,
        },
      });
    }

    return Response.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
