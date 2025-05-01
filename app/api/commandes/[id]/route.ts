import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const orderId = Number.parseInt(params.id);

    let commande;

    if (role === "CLIENT") {
      commande = await prisma.commande.findFirst({
        where: {
          id: orderId,
          clientId: userId,
        },
        include: {
          produits: true,
          factures: true,
        },
      });
    } else if (role === "ASSISTANT") {
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
      });
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    if (!commande) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    return new Response(JSON.stringify(commande), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = user.role;
    const orderId = Number.parseInt(params.id);
    const body = await req.json();

    const existingOrder = await prisma.commande.findUnique({
      where: { id: orderId },
      include: { produits: true },
    });

    if (!existingOrder) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    if (role === "CLIENT") {
      const clientId = Number.parseInt(user.id);

      if (existingOrder.clientId !== clientId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 });
      }

      if (existingOrder.statut !== "En attente") {
        return Response.json({ error: "Impossible de modifier une commande qui n'est pas en attente" }, { status: 400 });
      }

      // 🔥 Update commande principale
      const updatedOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          nom: body.nom,
          pays: body.pays,
          adresse: body.adresse,
          valeurMarchandise: Number(body.valeurMarchandise),
          typeCommande: body.typeCommande,
          typeTransport: body.typeTransport,
          ecoterme: body.ecoterme,
          modePaiement: body.modePaiement,
          dateDePickup: body.dateDePickup ? new Date(body.dateDePickup) : existingOrder.dateDePickup,
          nomDestinataire: body.nomDestinataire,
          paysDestinataire: body.paysDestinataire,
          adresseDestinataire: body.adresseDestinataire,
          indicatifTelephoneDestinataire: body.indicatifTelephoneDestinataire,
          telephoneDestinataire: Number(body.telephoneDestinataire),
          emailDestinataire: body.emailDestinataire,
        },
      });

      // 🔥 Supprimer tous les anciens produits
      await prisma.produit.deleteMany({
        where: { idCommande: orderId },
      });

      // 🔥 Ajouter les nouveaux produits
      if (body.produits && Array.isArray(body.produits)) {
        await prisma.produit.createMany({
          data: body.produits.map((p: any) => ({
            idCommande: orderId,
            nom: p.nom,
            categorie: p.categorie,
            tarifUnitaire: Number(p.tarifUnitaire),
            poids: Number(p.poids),
            largeur: Number(p.largeur),
            longueur: Number(p.longueur),
            hauteur: Number(p.hauteur),
            quantite: Number(p.quantite),
            typeConditionnement: p.typeConditionnement,
            fragile: Boolean(p.fragile),
            description: p.description || "",
            image: typeof p.image === "string" ? p.image : null,
            document: typeof p.document === "string" ? p.document : null,
          })),
        });
      }

      // 🔥 Retourner commande mise à jour avec produits
      const updatedOrderWithProducts = await prisma.commande.findUnique({
        where: { id: orderId },
        include: { produits: true },
      });

      return Response.json(updatedOrderWithProducts);
    }

    // 🔥 Assistant role
    else if (role === "ASSISTANT") {
      const assistantId = Number.parseInt(user.id);

      const updatedOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          statut: body.status || existingOrder.statut,
          assistantId: body.assignToMe ? assistantId : existingOrder.assistantId,
          adresseActuel: body.adresseActuel || existingOrder.adresseActuel,
        },
      });

      if (body.status && body.status !== existingOrder.statut) {
        await prisma.notification.create({
          data: {
            type: "statut",
            correspond: `Le statut de votre commande ${updatedOrder.nom} a été mis à jour: ${updatedOrder.statut}.`,
            lu: false,
            clientId: updatedOrder.clientId,
          },
        });
      }

      return Response.json(updatedOrder);
    }

    else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const orderId = Number.parseInt(params.id);

    const existingOrder = await prisma.commande.findUnique({
      where: { id: orderId },
      include: { produits: true },
    });

    if (!existingOrder) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    if (role === "CLIENT") {
      if (existingOrder.clientId !== userId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 });
      }

      if (existingOrder.statut !== "En attente") {
        return Response.json({ error: "Impossible d'annuler une commande qui n'est pas en attente" }, { status: 400 });
      }

      const cancelledOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          statut: "Annulée",
        },
      });

      await prisma.notification.create({
        data: {
          type: "commande",
          correspond: `Votre commande ${cancelledOrder.nom} a été annulée.`,
          lu: false,
          clientId: userId,
        },
      });

      return Response.json(cancelledOrder);
    } else if (role === "ASSISTANT") {
      const rejectedOrder = await prisma.commande.update({
        where: { id: orderId },
        data: {
          statut: "Refusée",
          assistantId: userId,
        },
      });

      await prisma.notification.create({
        data: {
          type: "commande",
          correspond: `Votre commande ${rejectedOrder.nom} a été refusée par l'assistant.`,
          lu: false,
          clientId: rejectedOrder.clientId,
        },
      });

      return Response.json(rejectedOrder);
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
