import { type NextRequest } from "next/server";
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
    const result = await AgentService.recevoirNotification(agentId);
    console.log(result);
    if (!result.success) {
      return ApiResponse.error(
        result.error ?? "Erreur lors de la récupération des notifications",
        { status: 400 }
      );
    }

    return ApiResponse.success(result.notifications);
  } catch (error) {
    console.error("Error in GET /api/agent/notifications:", error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const { notificationId } = await req.json();
    const result = await AgentService.marquerLuNotification(notificationId);

    if (!result.success) {
      return ApiResponse.error(
        result.error ?? "Impossible de marquer la notification comme lue",
        { status: 400 }
      );
    }

    return ApiResponse.success(result.notification);
  } catch (error) {
    console.error("Error in PUT /api/agent/notifications:", error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
