import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

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

    const id = params.id;
    console.log("ID", id);

    const body = await req.json();
    const { status } = body;
    console.log("BODY", body);
    if (!status || (status !== "actif" && status !== "inactif")) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Update payment method status
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        statut: status,
      },
    });

    return NextResponse.json({
      id: updatedMethod.id.toString(),
      status,
      message: `Méthode de paiement ${
        status === "actif" ? "activée" : "désactivée"
      } avec succès`,
    });
  } catch (error) {
    console.error("Error updating payment method status:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
