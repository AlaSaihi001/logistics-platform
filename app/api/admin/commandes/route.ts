import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "@/lib/api-response";

const prisma = new PrismaClient();

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

      const stats = await prisma.commande.findMany({
        include: {
          client: true,
        },
      });
      console.log(stats);
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
