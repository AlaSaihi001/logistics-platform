import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;

    let commandes;

    if (role === "ASSISTANT") {
      const page = Number.parseInt(req.nextUrl.searchParams.get("page") || "1");
      const limit = Number.parseInt(
        req.nextUrl.searchParams.get("limit") || "20"
      );
      const skip = (page - 1) * limit;

      commandes = await prisma.commande.findMany({
        where: {
          OR: [{ assistantId: userId }, { assistantId: null }],
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });
    } else if (role === "CLIENT") {
      commandes = await prisma.commande.findMany({
        where: { clientId: userId },
        include: {
          produits: true,
          factures: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    return Response.json(commandes);
  } catch (error) {
    console.error("Error fetching orders:", error);
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
    console.log(body);
    // Validation
    if (!body.produits || body.produits.length === 0) {
      return Response.json(
        { error: "Veuillez ajouter au moins un produit" },
        { status: 400 }
      );
    }

    const newOrder = await prisma.commande.create({
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
        statut: "En attente",
        adresseActuel: body.adresse,
        dateArrivage: "test",
        clientId: clientId,
        assistantId: 112,
        notes: {},
        produits: {
          create: body.produits.map((produit: any) => ({
            nom: produit.nom,
            categorie: produit.categorie,
            tarifUnitaire: Number.parseFloat(produit.tarifUnitaire),
            poids: Number.parseFloat(produit.poids),
            largeur: Number.parseFloat(produit.largeur),
            longueur: Number.parseFloat(produit.longueur),
            hauteur: Number.parseFloat(produit.hauteur),
            quantite: Number.parseInt(produit.quantite),
            typeConditionnement: produit.typeConditionnement,
            fragile: produit.fragile === "true" || produit.fragile === true,
            description: produit.description || null,
            image: produit.image || null,
            document: produit.document || null,
          })),
        },
      },
      include: {
        produits: true,
      },
    });

    await prisma.notification.create({
      data: {
        type: "commande",
        correspond: `Votre commande ${newOrder.nom} a été créée avec succès.`,
        lu: false,
        clientId: clientId,
        assistantId: 112,
      },
    });

    return Response.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
