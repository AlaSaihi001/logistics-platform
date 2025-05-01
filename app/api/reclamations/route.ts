import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";

// Récupération des réclamations
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const statusFilter = req.nextUrl.searchParams.get("status");

    let reclamations;

    if (role === "CLIENT") {
      const whereClause: any = { idClient: userId };
      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") };
      }
      reclamations = await prisma.reclamation.findMany({
        where: whereClause,
        orderBy: { date: "desc" },
      });
    } else if (role === "ASSISTANT") {
      const whereClause: any = {};
      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") };
      }
      reclamations = await prisma.reclamation.findMany({
        where: whereClause,
        include: {
          client: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
        orderBy: { date: "desc" },
      });
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    return Response.json(reclamations);
  } catch (error) {
    console.error("Error fetching claims:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Création d'une nouvelle réclamation

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    // Vérification si l'utilisateur est un client
    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const clientId = Number.parseInt(user.id); // Récupération de l'ID du client
    const body = await req.json(); // Récupération du corps de la requête JSON

    // Si des pièces jointes sont présentes, on les traite
    const documents = body.attachments && body.attachments.length
      ? body.attachments.map((doc: any) => ({
          name: doc.name,  // Nom du document
          url: doc.url     // URL du document
        }))
      : null;

    // Création de la réclamation dans la base de données
    const newClaim = await prisma.reclamation.create({
      data: {
        idClient: clientId, // Association avec le client
        sujet: body.claimType, // Le type de réclamation
        description: body.description, // Description de la réclamation
        documents: documents ? documents : null, // Les documents sous forme de tableau d'objets {nom, url}
        status: "Ouverte", // Par défaut, une réclamation commence avec le statut "Ouverte"
        date: new Date(), // La date de la réclamation est la date actuelle
      },
    });

    // Création d'une notification pour informer l'utilisateur de la réclamation
    await prisma.notification.create({
      data: {
        type: "reclamation", // Type de notification
        correspond: `Une nouvelle réclamation a été créée: ${newClaim.sujet}.`, // Message de notification
        lu: false, // L'état de la notification (non lue)
        clientId: clientId, // ID du client pour associer la notification à ce client
      },
    });

    // Retour de la réclamation nouvellement créée avec un statut 201 (créé avec succès)
    return Response.json(newClaim, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


// Mise à jour d'une réclamation (incluant la réponse de l'assistant)
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const body = await req.json();

    const existingClaim = await prisma.reclamation.findUnique({
      where: { id: Number.parseInt(body.id) },
    });

    if (!existingClaim) {
      return Response.json({ error: "Réclamation non trouvée" }, { status: 404 });
    }

    if (role === "CLIENT") {
      if (existingClaim.idClient !== userId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 });
      }

      const updatedClaim = await prisma.reclamation.update({
        where: { id: Number.parseInt(body.id) },
        data: {
          description: body.description ? sanitizeHtml(body.description) : existingClaim.description,
          documents: body.documents ? JSON.stringify(body.documents) : existingClaim.documents,
        },
      });

      return Response.json(updatedClaim);
    } else if (role === "ASSISTANT") {
      const updatedClaim = await prisma.reclamation.update({
        where: { id: Number.parseInt(body.id) },
        data: {
          status: body.status || existingClaim.status,
          assistantId: body.assignToMe ? userId : existingClaim.assistantId,
          response: body.response || existingClaim.response, // Réponse de l'assistant ajoutée
        },
        include: {
          client: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
      });

      if (body.status && body.status !== existingClaim.status) {
        await prisma.notification.create({
          data: {
            type: "reclamation",
            correspond: `Le statut de votre réclamation "${updatedClaim.sujet}" a été mis à jour: ${updatedClaim.status}.`,
            lu: false,
            clientId: updatedClaim.idClient,
          },
        });
      }

      return Response.json(updatedClaim);
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error updating claim:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
