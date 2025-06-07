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
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { dateCreation: "desc" },
    });

    // Format payment methods
    const formattedMethods = paymentMethods.map((method) => ({
      id: method.id.toString(),
      nom: method.nom,
      description: method.description || "",
      frais: `${method.frais}%`,
      fraisFixe: `${method.fraisFixe} €`,
      statut: method.statut ? "actif" : "inactif",
      dateCreation: new Date(method.dateCreation).toLocaleDateString("fr-FR"),
      derniereMaj: new Date(method.derniereMaj).toLocaleDateString("fr-FR"),
    }));

    return NextResponse.json(formattedMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/payment-methods - Create a new payment method
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { nom, description, frais, fraisFixe, statut } = body;

    // Validate required fields
    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    // Parse frais and fraisFixe
    // const fraisPourcentage = Number.parseFloat(frais.replace("%", ""));
    // const fraisFixeValue = Number.parseFloat(fraisFixe.replace("€", ""));

    // if (isNaN(fraisPourcentage) || isNaN(fraisFixeValue)) {
    //   return NextResponse.json(
    //     { error: "Les frais doivent être des nombres valides" },
    //     { status: 400 }
    //   );
    // }

    // Create new payment method
    const newMethod = await prisma.paymentMethod.create({
      data: {
        nom,
        description,
        frais,
        fraisFixe,
        statut,
        dateCreation: new Date().toISOString(),
        derniereMaj: new Date().toISOString(),
      },
    });

    // Format response
    const formattedMethod = {
      id: newMethod.id.toString(),
      nom: newMethod.nom,
      description: newMethod.description || "",
      frais: `${newMethod.frais}%`,
      fraisFixe: `${newMethod.fraisFixe} €`,
      statut: newMethod.statut ? "actif" : "inactif",
      dateCreation: new Date(newMethod.dateCreation).toLocaleDateString(
        "fr-FR"
      ),
      derniereMaj: new Date(newMethod.derniereMaj).toLocaleDateString("fr-FR"),
    };

    return NextResponse.json(formattedMethod, { status: 201 });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
