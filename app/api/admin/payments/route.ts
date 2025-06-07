import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";
// GET /api/admin/payment-methods - Get all payment methods
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Get payment methods from database
    const paiements = await prisma.facture.findMany({
      orderBy: { dateEmission: "desc" },
      include: {
        client: true,
      },
    });
    console.log(paiements);
    return NextResponse.json(paiements);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
