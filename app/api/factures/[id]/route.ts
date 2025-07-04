import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const factureId = Number.parseInt(params.id); // Assurez-vous que l'ID de la facture est défini
    console.log(factureId);
    if (!factureId) {
      return Response.json(
        { error: "ID de facture invalide" },
        { status: 400 }
      );
    }

    let facture;

    // Si l'utilisateur est un client, on filtre par l'ID du client
    if (role === "CLIENT") {
      facture = await prisma.facture.findFirst({
        where: {
          id: factureId, // Utilisation correcte de l'ID de la facture
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
      });
    } else if (role === "ASSISTANT") {
      // Si l'utilisateur est un assistant, on permet d'accéder à toutes les factures
      facture = await prisma.facture.findUnique({
        where: {
          id: factureId, // Recherche de la facture par ID
        },
        include: {
          commande: {
            include: {
              produits: true,
              client: true,
            },
          },
          paiement: true,
          client: true,
        },
      });
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    if (!facture) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 });
    }
    console.log("FAAAAAAAAAAAAACTURE:", facture);
    return Response.json(facture); // Retour de la facture avec les données pertinentes
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = user.role;
    const factureId = Number.parseInt(params.id);
    const body = await req.json();

    const existingInvoice = await prisma.facture.findUnique({
      where: { id: factureId },
    });

    if (!existingInvoice) {
      return Response.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    if (role === "ASSISTANT") {
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
      });

      if (body.status && body.status !== existingInvoice.status) {
        await prisma.notification.create({
          data: {
            type: "facture",
            correspond: `Le statut de votre facture #${updatedInvoice.numeroFacture} a été mis à jour: ${updatedInvoice.status}.`,
            lu: false,
            clientId: updatedInvoice.idClient,
          },
        });
      }

      return Response.json(updatedInvoice);
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error updating invoice:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
