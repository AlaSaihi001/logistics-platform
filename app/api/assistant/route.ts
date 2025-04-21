import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils"; // JWT helper to extract user
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";  // Importer Prisma pour interagir avec la base de données

// export async function GET(req: NextRequest) {
//   try {
//     // Extract the user from the token
//     const user = await getUserFromToken(req);

//     // Check if the user is an assistant
//     if (!user || user.role !== "ASSISTANT") {
//       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
//     }

//     // Your assistant route logic here
//     return NextResponse.json({ message: "Bienvenue, assistant!" });

//   } catch (error) {
//     console.error("Erreur lors de la vérification de l'assistant:", error);
//     return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'utilisateur via JWT
    const user = await getUserFromToken(req);

    if (!user || user.role !== "ADMIN") {
      return ApiResponse.error("Non autorisé", { status: 403 });
    }

    // Récupérer tous les assistants
    const assistants = await prisma.assistant.findMany({
      select: { /* Same as above */ }
    });

    return NextResponse.json(assistants);
  } catch (error) {
    console.error("Erreur lors de la récupération des assistants:", error);
    return ApiResponse.serverError("Erreur interne.");
  }
}
