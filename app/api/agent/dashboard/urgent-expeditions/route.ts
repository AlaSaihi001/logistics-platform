import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { ApiResponse } from "@/lib/api-response";
import { AgentService } from "@/lib/agent-service";
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }
    const agentId = Number(user.id);
    const urgent = await AgentService.getUrgent(agentId);
    console.log(urgent);
    return ApiResponse.success(urgent);
  } catch (error) {
    console.error(
      "Error in GET /api/agent/dashboard/urgent-expeditions:",
      error
    );
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
