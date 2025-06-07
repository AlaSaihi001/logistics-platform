import { type NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { ApiResponse } from "@/lib/api-response";
import { getAssistantCommandes } from "@/lib/assistant-service";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Authentification via JWT
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ASSISTANT") {
      return ApiResponse.unauthorized();
    }

    // ✅ Récupération des commandes de l’assistant
    const assistantId = Number.parseInt(user.id);
    const commandes = await getAssistantCommandes(assistantId);
    console.log(commandes);
    return ApiResponse.success(commandes);
  } catch (error) {
    console.error("Error fetching assistant commandes:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la récupération des commandes"
    );
  }
}
