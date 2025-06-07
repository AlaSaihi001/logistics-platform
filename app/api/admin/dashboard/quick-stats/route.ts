import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { ApiResponse } from "@/lib/api-response";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const cookiesStore = await cookies(); // await the Promise first
    const token = cookiesStore.get("auth-token")?.value;

    if (!token) {
      return ApiResponse.unauthorized();
    }

    try {
      // Verify token
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
        id: string;
        role: string;
      };

      // Check if user is admin
      if (decoded.role !== "ADMIN") {
        return ApiResponse.forbidden("Accès réservé aux administrateurs");
      }

      // Get pending orders count
      const pendingOrders = await prisma.commande.count({
        where: {
          statut: "En attente",
        },
      });

      // Get pending payments count
      const pendingPayments = await prisma.facture.count({
        where: {
          status: {
            in: ["En attente", "En retard"],
          },
        },
      });

      // Get open tickets count
      const openTickets = await prisma.reclamation.count({
        where: {
          status: {
            in: ["Ouverte", "En cours"],
          },
        },
      });

      return ApiResponse.success({
        pendingOrders,
        pendingPayments,
        openTickets,
      });
    } catch (error) {
      // Token is invalid or expired
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
