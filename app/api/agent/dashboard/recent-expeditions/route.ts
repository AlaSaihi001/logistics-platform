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
    const recentExpeditions = await AgentService.getRecent(agentId);
    console.log(recentExpeditions);
    return ApiResponse.success(recentExpeditions);
  } catch (error) {
    console.error(
      "Error in GET /api/agent/dashboard/recent-expeditions:",
      error
    );
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
