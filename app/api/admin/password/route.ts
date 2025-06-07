import { type NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { ApiResponse } from "@/lib/api-response";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function modifierMotDePasse(
  agentId: number,
  currentPassword: string,
  newPassword: string
) {
  try {
    const admin = await prisma.administrateur.findUnique({
      where: { id: agentId },
    });
    if (!admin) return { success: false, error: "admin non trouvé" };
    if (admin.motDePasse !== currentPassword) {
      return { success: false, error: "Mot de passe actuel incorrect" };
    }
    await prisma.administrateur.update({
      where: { id: agentId },
      data: { motDePasse: newPassword },
    });

    return { success: true, message: "Mot de passe modifié avec succès" };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la modification du mot de passe",
    };
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "ADMIN") {
      return ApiResponse.unauthorized();
    }

    const { currentPassword, newPassword } = await req.json();
    const agentId = Number.parseInt(user.id);
    const result = await modifierMotDePasse(
      agentId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return ApiResponse.error(
        result.error ?? "Échec de la mise à jour du mot de passe",
        { status: 400 }
      );
    }
    console.log(result);
    return ApiResponse.success({ message: result.message });
  } catch (error) {
    console.error("Error in PUT /api/admin/password:", error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
