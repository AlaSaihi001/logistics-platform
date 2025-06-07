import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const agentId = Number(user.id);

    const pendingOrders = await prisma.commande.count({
      where: {
        statut: "Acceptée", // ✅ corriger ici
        agentId,
      },
    });

    const pendingDocuments = await prisma.document.count({
      where: {
        statut: "À valider",
        idAgent: agentId,
      },
    });

    const pendingInvoices = await prisma.facture.count({
      where: {
        status: "À envoyer",
        commande: {
          agentId,
        },
      },
    });

    const unreadNotifications = await prisma.notification.count({
      where: {
        agentId: agentId, // ou assistantId / clientId selon le contexte
        lu: false,
      },
    });

    return ApiResponse.success({
      pendingOrders,
      pendingDocuments,
      pendingInvoices,
      unreadNotifications,
    });
  } catch (error) {
    console.error("Error fetching agent dashboard stats:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors du chargement des statistiques"
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const agentId = Number(user.id);

    // HISTO DATA: Number of commandes per month for the agent
    const histoRaw = await prisma.commande.groupBy({
      by: ["dateCommande"],
      where: {
        agentId: agentId,
      },
      _count: {
        id: true,
      },
    });
    // Format histo data with month names (e.g., "May")
    const formatter = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    });
    // Format histo data to group by month
    const HistoData = histoRaw.reduce((acc, curr) => {
      const monthName = formatter.format(curr.dateCommande); // e.g., "mai 2025"
      acc[monthName] = (acc[monthName] || 0) + curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // PIE DATA: Number of factures per statut for the agent
    const PieData = await prisma.facture.groupBy({
      by: ["status"],
      where: {
        idAgent: agentId,
      },
      _count: {
        id: true,
      },
    });

    return ApiResponse.success({
      HistoData,
      PieData: PieData.map((item) => ({
        statut: item.status,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching agent dashboard stats:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors du chargement des statistiques"
    );
  }
}
