import { type NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { ApiResponse } from "@/lib/api-response";
import {
  getCommandeDetails,
  validerCommande,
  rejeterCommande,
  updateCommandeStatus,
} from "@/lib/assistant-service";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ASSISTANT") {
      return ApiResponse.unauthorized();
    }

    const commandeId = parseInt(context.params.id); // ✅ FIX HERE
    const commande = await getCommandeDetails(commandeId);

    if (!commande) {
      return ApiResponse.notFound("Commande non trouvée");
    }
    console.log(commande);
    return ApiResponse.success(commande);
  } catch (error) {
    console.error("Error fetching commande details:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la récupération des détails de la commande"
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

    const { action, status, raison, agentId } = await request.json();
    const commandeId = Number.parseInt(params.id);
    const assistantId = Number.parseInt(user.id);
    const agent = Number.parseInt(agentId);
    let result;

    if (action === "valider") {
      result = await validerCommande(commandeId, assistantId, agent);
    } else if (action === "rejeter") {
      if (!raison) {
        return ApiResponse.validationError({
          raison: "La raison du rejet est requise",
        });
      }
      result = await rejeterCommande(commandeId, assistantId, raison);
    } else if (action === "updateStatus") {
      if (!status) {
        return ApiResponse.validationError({ status: "Le statut est requis" });
      }
      result = await updateCommandeStatus(commandeId, status);
    } else {
      return ApiResponse.error("Action non valide", { status: 400 });
    }

    return ApiResponse.success(result);
  } catch (error) {
    console.error("Error updating commande:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la mise à jour de la commande"
    );
  }
}
