import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import {
  getFactureDetails,
  envoyerFactureClient,
} from "@/lib/assistant-service";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ASSISTANT") {
      return ApiResponse.unauthorized();
    }

    const factureId = Number.parseInt(params.id);
    const facture = await getFactureDetails(factureId);
    console.log(facture);
    if (!facture) {
      return ApiResponse.notFound("Facture non trouvée");
    }

    return ApiResponse.success(facture);
  } catch (error) {
    console.error("Error fetching facture details:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la récupération des détails de la facture"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ASSISTANT") {
      return ApiResponse.unauthorized();
    }

    const { action } = await request.json();
    const factureId = Number.parseInt(params.id);

    if (action !== "envoyer") {
      return ApiResponse.error("Action non valide", { status: 400 });
    }

    const result = await envoyerFactureClient(factureId);

    return ApiResponse.success(result);
  } catch (error) {
    console.error("Error updating facture:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la mise à jour de la facture"
    );
  }
}
