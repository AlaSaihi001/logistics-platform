import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils"; // Function to get user from JWT token
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
    const reclamationId = Number.parseInt(params.id);

    let reclamation;

    if (role === "CLIENT") {
      // Client can only view their own claims
      reclamation = await prisma.reclamation.findFirst({
        where: {
          id: reclamationId,
          idClient: userId,
        },
      });
    } else if (role === "ASSISTANT") {
      // Assistant can view all claims
      reclamation = await prisma.reclamation.findUnique({
        where: {
          id: reclamationId,
        },
        include: {
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
      });
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    if (!reclamation) {
      return Response.json(
        { error: "Réclamation non trouvée" },
        { status: 404 }
      );
    }

    // Parse documents if they exist
    if (reclamation.documents) {
      // reclamation.documents = JSON.parse(reclamation.documents as string);
      reclamation.documents = "";
    }

    return Response.json(reclamation);
  } catch (error) {
    console.error("Error fetching claim:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT method to update the claim (e.g., change status)
// PUT method to update the claim (e.g., change status)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const body = await req.json();

    const reclamationId = Number.parseInt(params.id);

    // Fetch the claim
    const reclamation = await prisma.reclamation.findUnique({
      where: {
        id: reclamationId,
      },
    });

    if (!reclamation) {
      return Response.json(
        { error: "Réclamation non trouvée" },
        { status: 404 }
      );
    }

    // Ensure that a client can only update their own claims
    if (reclamation.idClient !== userId && user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Update the status or assistant's response
    const updatedClaim = await prisma.reclamation.update({
      where: {
        id: reclamationId,
      },
      data: {
        status: body.status || reclamation.status, // Update status if provided
        response: body.response ? body.response : reclamation.response, // Handle response correctly
      },
    });

    return Response.json(updatedClaim);
  } catch (error) {
    console.error("Error updating claim:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
