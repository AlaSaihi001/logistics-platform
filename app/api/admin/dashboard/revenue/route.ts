import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const paidInvoices = await prisma.facture.findMany({
      where: { status: "Payée" },
      select: {
        montant: true,
        dateEmission: true,
      },
    });

    // Aggregate total revenue per month
    const revenueByMonth = paidInvoices.reduce(
      (acc, { montant, dateEmission }) => {
        const date = new Date(dateEmission);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!acc[key]) acc[key] = 0;
        acc[key] += montant;

        return acc;
      },
      {} as Record<string, number>
    );

    // Convert to array format
    const revenueArray = Object.entries(revenueByMonth).map(
      ([month, total]) => ({
        month,
        total,
      })
    );
    console.log(revenueArray);
    return ApiResponse.success(revenueArray);
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return ApiResponse.serverError(
      "Erreur lors du calcul du chiffre d'affaires mensuel"
    );
  }
}
