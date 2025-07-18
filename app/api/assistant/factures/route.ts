import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { getAssistantFactures } from "@/lib/assistant-service";
import { ApiResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ASSISTANT") {
      return ApiResponse.unauthorized();
    }

    const assistantId = Number.parseInt(user.id);
    const factures = await getAssistantFactures(assistantId);
    // ❌ Filter out factures with empty document
    const filteredFactures = factures.filter(
      (facture) => facture.document !== '""'
    );

    console.log(filteredFactures);
    return ApiResponse.success(filteredFactures);
  } catch (error) {
    console.error("Error fetching assistant factures:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la récupération des factures"
    );
  }
}
