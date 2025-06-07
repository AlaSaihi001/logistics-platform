import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { AgentService } from "@/lib/agent-service";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const agentId = Number.parseInt(user.id);
    const result = await AgentService.gererFactures(agentId);

    if (!result.success) {
      return ApiResponse.error(
        result.error ?? "Erreur lors de la récupération des factures",
        { status: 400 }
      );
    }
    console.log(result.factures);
    return ApiResponse.success(result.factures);
  } catch (error) {
    console.error("Error in GET /api/agent/factures:", error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const data = await req.json();
    // À compléter : logique pour créer une facture via AgentService
    console.log(data);
    return ApiResponse.success(
      { message: "Facture créée avec succès" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/agent/factures:", error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
