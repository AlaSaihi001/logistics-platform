import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/jwt-utils";

export async function GET(req: NextRequest) {
  console.log("📥 [GET] /api/factures called");

  try {
    // Step 1: Extract and validate user
    const user = await getUserFromToken(req);
    console.log("🔑 User from token:", user);

    if (!user) {
      console.warn("🚫 No user found from token");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = Number.parseInt(user.id);
    const role = user.role;
    const statusFilter = req.nextUrl.searchParams.get("status");

    console.log("🧾 Parsed userId:", userId);
    console.log("🧑‍💼 User role:", role);
    console.log("🔍 Status filter:", statusFilter);

    let factures;

    // Step 2: Handle CLIENT role
    if (role === "CLIENT") {
      const whereClause: any = { idClient: userId };

      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") };
      }

      console.log("🧮 CLIENT whereClause:", whereClause);

      factures = await prisma.facture.findMany({
        where: whereClause,
        include: {
          commande: true,
          paiement: true,
        },
        orderBy: { dateEmission: "desc" },
      });

      console.log("📄 Factures for CLIENT:", factures);
    }

    // Step 3: Handle ASSISTANT role
    else if (role === "ASSISTANT") {
      const whereClause: any = {};

      if (statusFilter) {
        whereClause.status = { in: statusFilter.split(",") };
      }

      console.log("🧮 ASSISTANT whereClause:", whereClause);

      factures = await prisma.facture.findMany({
        where: whereClause,
        include: {
          commande: true,
          paiement: true,
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
        orderBy: { dateEmission: "desc" },
      });

      console.log("📄 Factures for ASSISTANT:", factures);
    }

    // Step 4: Unknown role
    else {
      console.warn("⛔ Unauthorized role:", role);
      return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    // Step 5: Return result
    console.log("✅ Returning factures:", JSON.stringify(factures, null, 2));
    return NextResponse.json(factures);
  } catch (error: any) {
    console.error("❌ Error fetching invoices:", error?.message || error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const assistantId = Number.parseInt(user.id);
    const body = await req.json();

    if (!body.idCommande || !body.montant) {
      return Response.json(
        {
          error: "Données manquantes",
          details: "L'ID de commande et le montant sont requis",
        },
        { status: 400 }
      );
    }

    const montant = Number.parseFloat(body.montant);
    if (isNaN(montant) || montant <= 0) {
      return Response.json(
        {
          error: "Montant invalide",
          details: "Le montant doit être un nombre positif",
        },
        { status: 400 }
      );
    }

    const order = await prisma.commande.findUnique({
      where: { id: Number.parseInt(body.idCommande) },
    });

    if (!order) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    const lastInvoice = await prisma.facture.findFirst({
      orderBy: { numeroFacture: "desc" },
    });

    const nextInvoiceNumber = lastInvoice
      ? lastInvoice.numeroFacture + 1
      : 1000;

    const newInvoice = await prisma.facture.create({
      data: {
        idCommande: Number.parseInt(body.idCommande),
        idClient: order.clientId,
        idAgent: assistantId,
        document: body.document || null,
        numeroFacture: nextInvoiceNumber,
        montant: montant,
        dateEmission: new Date(),
        status: "En attente",
      },
      include: {
        commande: true,
      },
    });

    await prisma.notification.create({
      data: {
        type: "facture",
        correspond: `Une nouvelle facture #${newInvoice.numeroFacture} a été créée pour votre commande ${order.nom}.`,
        lu: false,
        clientId: order.clientId,
      },
    });

    return Response.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "ASSISTANT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    const updatedInvoice = await prisma.facture.update({
      where: { id: Number.parseInt(body.id) },
      data: {
        status: body.status,
        document: body.document || undefined,
      },
      include: {
        commande: true,
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

    await prisma.notification.create({
      data: {
        type: "facture",
        correspond: `Le statut de votre facture #${updatedInvoice.numeroFacture} a été mis à jour: ${updatedInvoice.status}.`,
        lu: false,
        clientId: updatedInvoice.idClient,
      },
    });

    return Response.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
