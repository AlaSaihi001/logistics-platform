// /api/client/commandes/[clientId].ts

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
    const commandes = await prisma.commande.findMany({
      where: { clientId },
    });

    return NextResponse.json(commandes);
  } catch (error) {
    console.error("Error fetching commandes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
