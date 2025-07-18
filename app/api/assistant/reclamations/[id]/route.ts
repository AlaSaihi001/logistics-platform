import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import {
  RespondReclamation,
  getReclamationDetails,
  updateReclamationStatus,
} from "@/lib/assistant-service";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const reclamationId = Number.parseInt(params.id);
    const reclamation = await getReclamationDetails(reclamationId);

    if (!reclamation) {
      return NextResponse.json(
        { error: "Réclamation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(reclamation);
  } catch (error) {
    console.error("Error fetching reclamation details:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la récupération des détails de la réclamation",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { status } = await request.json();
    const reclamationId = Number.parseInt(params.id);
    const assistantId = Number.parseInt(user.id);

    if (!status) {
      return NextResponse.json(
        { error: "Le statut est requis" },
        { status: 400 }
      );
    }

    const result = await updateReclamationStatus(
      reclamationId,
      assistantId,
      status
    );

    // Création de la notification
    await prisma.notification.create({
      data: {
        type: "reclamation",
        correspond: `Le statut de la réclamation #${reclamationId} a été mis à jour à "${status}".`,
        lu: false,
        assistantId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating reclamation:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la mise à jour de la réclamation",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { response } = await request.json();
    const reclamationId = Number.parseInt(params.id);
    const assistantId = Number.parseInt(user.id);

    if (!response) {
      return NextResponse.json(
        { error: "La Réponse est requise" },
        { status: 400 }
      );
    }

    const result = await RespondReclamation(
      reclamationId,
      assistantId,
      response
    );

    // Création de la notification
    await prisma.notification.create({
      data: {
        type: "reclamation",
        correspond: `Vous avez répondu à la réclamation #${reclamationId}.`,
        lu: false,
        assistantId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error response reclamation:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la réponse de la réclamation",
      },
      { status: 500 }
    );
  }
}
