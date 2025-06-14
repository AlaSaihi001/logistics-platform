import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

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

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const clientId = Number.parseInt(user.id);

    const assistant = await prisma.assistant.findUnique({
      where: { id: 2 },
    });
    const assistantId = Number.parseInt(assistant.id);

    const body = await req.json();

    const documents = body.attachments && body.attachments.length()? body.attachments.map((doc: any) => [doc.name, doc.url])
      : null;

    const newClaim = await prisma.reclamation.create({
      data: {
        idClient: clientId,
        assistantId: 2,
        sujet: body.claimType,
        description: body.description,
        documents: documents,
        status: "Ouverte",
        date: new Date(),
      },
    });

   // Créer une notification pour l'assistant
    await prisma.notification.create({
      data: {
        type: "reclamation",
        correspond: `Votre réclamation "${newClaim.sujet}" a été créée avec succès.`,
        lu: false,
        assistantId,
        clientId, // Remplacez 2 par l'ID de l'assistant
      },
    });



    return Response.json(newClaim, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
