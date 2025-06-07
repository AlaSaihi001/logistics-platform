import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { ApiResponse } from "@/lib/api-response";
import { AgentService } from "@/lib/agent-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const { dateFrom, dateTo } = await req.json();
    const agentId = Number(user.id);
    const stats = await AgentService.getStats(agentId, dateFrom, dateTo);
    console.log(stats);
    return ApiResponse.success(stats);
  } catch (error) {
    console.error("Error in GET /api/agent/dashboard/stats:", error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
