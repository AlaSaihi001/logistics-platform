// /api/client/factures/[clientId].ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust if needed for your prisma setup
import { getUserFromToken } from '@/lib/jwt-utils'; // Adjust if needed for your token setup

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const clientId = parseInt(req.url.split('/')[5]);  // This will get the clientId from the URL
    const statusFilter = req.nextUrl.searchParams.get("status");

    let factures;

    if (statusFilter) {
      // Filtrage par statut si précisé
      factures = await prisma.facture.findMany({
        where: {
          idClient: clientId,
          status: { in: statusFilter.split(",") },
        },
        include: { commande: true, paiement: true },
        orderBy: { dateEmission: "desc" },
      });
    } else {
      // Sinon, toutes les factures
      factures = await prisma.facture.findMany({
        where: { idClient: clientId },
        include: { commande: true, paiement: true },
        orderBy: { dateEmission: "desc" },
      });
    }

    return NextResponse.json(factures);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
