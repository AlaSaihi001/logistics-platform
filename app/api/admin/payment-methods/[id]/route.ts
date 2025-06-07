import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

// GET /api/admin/payment-methods/[id] - Get payment method details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // const id = Number.parseInt(params.id);

    // if (isNaN(id)) {
    //   return NextResponse.json(
    //     { error: "ID de méthode de paiement invalide" },
    //     { status: 400 }
    //   );
    // }

    // Get payment method from database
    const method = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    });

    if (!method) {
      return NextResponse.json(
        { error: "Méthode de paiement non trouvée" },
        { status: 404 }
      );
    }

    // Format response
    const formattedMethod = {
      id: method.id.toString(),
      nom: method.nom,
      description: method.description || "",
      frais: `${method.frais}%`,
      fraisFixe: `${method.fraisFixe} €`,
      statut: method.statut ? "actif" : "inactif",
      dateCreation: new Date(method.dateCreation).toLocaleDateString("fr-FR"),
      derniereMaj: new Date(method.derniereMaj).toLocaleDateString("fr-FR"),
    };

    return NextResponse.json(formattedMethod);
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/admin/payment-methods/[id] - Update a payment method
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // const id = Number.parseInt(params.id);

    // if (isNaN(id)) {
    //   return NextResponse.json(
    //     { error: "ID de méthode de paiement invalide" },
    //     { status: 400 }
    //   );
    // }

    const body = await req.json();
    const { nom, description, frais, fraisFixe, statut } = body;

    // Validate required fields
    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    // // Parse frais and fraisFixe
    // const fraisPourcentage = Number.parseFloat(frais.replace("%", ""));
    // const fraisFixeValue = Number.parseFloat(fraisFixe.replace("€", ""));

    // if (isNaN(fraisPourcentage) || isNaN(fraisFixeValue)) {
    //   return NextResponse.json(
    //     { error: "Les frais doivent être des nombres valides" },
    //     { status: 400 }
    //   );
    // }

    // Update payment method
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: {
        nom,
        description,
        frais,
        fraisFixe,
        statut,
      },
    });

    // Format response
    const formattedMethod = {
      id: updatedMethod.id.toString(),
      nom: updatedMethod.nom,
      description: updatedMethod.description || "",
      frais: `${updatedMethod.frais}%`,
      fraisFixe: `${updatedMethod.fraisFixe} €`,
      statut: updatedMethod.statut ? "actif" : "inactif",
      dateCreation: new Date(updatedMethod.dateCreation).toLocaleDateString(
        "fr-FR"
      ),
      derniereMaj: new Date(updatedMethod.derniereMaj).toLocaleDateString(
        "fr-FR"
      ),
    };

    return NextResponse.json(formattedMethod);
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/payment-methods/[id] - Delete a payment method
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  try {
    const user = await getUserFromToken(req);
    const { params } = await context;
    // Check if user is authenticated and is an admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // const id = Number.parseInt(params.id);

    // if (isNaN(id)) {
    //   return NextResponse.json(
    //     { error: "ID de méthode de paiement invalide" },
    //     { status: 400 }
    //   );
    // }

    // Check if the payment method is used in any transactions
    // const transactionsCount = await prisma.paiement.count({
    //   where: { id: params.id },
    // });

    // if (transactionsCount > 0) {
    //   return NextResponse.json(
    //     {
    //       error: "Impossible de supprimer cette méthode de paiement",
    //       details:
    //         "Cette méthode est utilisée dans des transactions existantes. Désactivez-la plutôt que de la supprimer.",
    //     },
    //     { status: 400 }
    //   );
    // }
    // Now use params.id safely
    const id = params.id;
    // Delete payment method
    await prisma.paymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({
      id: id.toString(),
      message: "Méthode de paiement supprimée avec succès",
    });
  } catch (error: any) {
    console.error("Error deleting payment method:", error);
    // Check if this is a foreign key constraint error
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Impossible de supprimer cette méthode de paiement",
          details:
            "Cette méthode est référencée par d'autres données dans le système.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
