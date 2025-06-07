import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "@/lib/api-response";

const prisma = new PrismaClient();

// Fonction pour obtenir le nombre total d'utilisateurs
async function getTotalUsers() {
  const [clients, assistants, agents, admins] = await Promise.all([
    prisma.client.count(),
    prisma.assistant.count(),
    prisma.agent.count(),
    prisma.administrateur.count(),
  ]);
  return clients + assistants + agents + admins;
}

// Fonction pour obtenir les statistiques de base
async function getStats() {
  const totalUsers = await getTotalUsers();
  const tatalAdmin = await prisma.administrateur.count();
  const tatalClient = await prisma.client.count();
  const tatalAssistant = await prisma.assistant.count();
  const totalAgent = await prisma.agent.count();
  const totalOrders = await prisma.commande.count();
  const pendingOrders = await prisma.commande.count({
    where: { statut: "En attente" },
  });
  const totalRevenue = await prisma.facture.aggregate({
    _sum: { montant: true },
    where: { status: "Payée" },
  });
  const pendingPayments = await prisma.facture.count({
    where: { status: { in: ["En attente", "En retard"] } },
  });
  const openTickets = await prisma.reclamation.count({
    where: { status: { in: ["Ouverte", "En cours"] } },
  });

  return {
    totalUsers,
    tatalAdmin,
    tatalClient,
    tatalAssistant,
    totalAgent,
    totalOrders,
    totalRevenue: totalRevenue._sum.montant || 0,
    pendingOrders,
    pendingPayments,
    openTickets,
  };
}

export async function GET(req: NextRequest) {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get("auth-token")?.value;
    if (!token) return ApiResponse.unauthorized();

    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
        id: string;
        role: string;
      };
      if (decoded.role !== "ADMIN")
        return ApiResponse.forbidden("Accès réservé aux administrateurs");

      const stats = await getStats();

      return ApiResponse.success(stats);
    } catch {
      cookiesStore.delete("auth-token");
      return ApiResponse.unauthorized();
    }
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors du chargement des statistiques"
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get("auth-token")?.value;
    if (!token) return ApiResponse.unauthorized();

    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
        id: string;
        role: string;
      };
      if (decoded.role !== "ADMIN")
        return ApiResponse.forbidden("Accès réservé aux administrateurs");

      const { from, to } = await req.json();
      if (!from || !to)
        return ApiResponse.error("Les dates de début et de fin sont requises");

      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Récupération des statistiques filtrées par plage de dates
      const totalUsers =
        (await prisma.client.count({
          where: { createdAt: { gte: fromDate, lte: toDate } },
        })) +
        (await prisma.assistant.count({
          where: { createdAt: { gte: fromDate, lte: toDate } },
        })) +
        (await prisma.agent.count({
          where: { createdAt: { gte: fromDate, lte: toDate } },
        })) +
        (await prisma.administrateur.count({
          where: { createdAt: { gte: fromDate, lte: toDate } },
        }));

      const totalOrders = await prisma.commande.count({
        where: { createdAt: { gte: fromDate, lte: toDate } },
      });

      const pendingOrders = await prisma.commande.count({
        where: {
          statut: "En attente",
          createdAt: { gte: fromDate, lte: toDate },
        },
      });

      const totalRevenue = await prisma.facture.aggregate({
        _sum: { montant: true },
        where: {
          status: "Payée",
          createdAt: { gte: fromDate, lte: toDate },
        },
      });

      const pendingPayments = await prisma.facture.count({
        where: {
          status: { in: ["En attente", "En retard"] },
          createdAt: { gte: fromDate, lte: toDate },
        },
      });

      const openTickets = await prisma.reclamation.count({
        where: {
          status: { in: ["Ouverte", "En cours"] },
          createdAt: { gte: fromDate, lte: toDate },
        },
      });

      return ApiResponse.success({
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.montant || 0,
        pendingOrders,
        pendingPayments,
        openTickets,
      });
    } catch {
      cookiesStore.delete("auth-token");
      return ApiResponse.unauthorized();
    }
  } catch (error) {
    console.error(
      "Error fetching admin dashboard stats with date range:",
      error
    );
    return ApiResponse.serverError(
      "Une erreur est survenue lors du chargement des statistiques"
    );
  }
}
