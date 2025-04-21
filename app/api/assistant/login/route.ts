import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { AuthService } from "@/lib/auth-service"; // Assumed service for authentication
import { ApiResponse } from "@/lib/api-response";
import { getUserFromToken } from "@/lib/jwt-utils";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'utilisateur via JWT
    const user = await getUserFromToken(req);

    if (!user || user.role !== "ASSISTANT") {
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


export async function POST(req: NextRequest) {
  try {
    // Étape 1: Récupérer et valider les données
    const { email, password } = await req.json();

    if (!email || !password) {
      return ApiResponse.error("Email et mot de passe sont requis.", { status: 400 });
    }

    // Étape 2: Authentifier l'assistant avec les identifiants fournis
    const result = await AuthService.authenticateAssistant(email, password); // Authentification de l'assistant

    if (!result.success) {
      return ApiResponse.error(`${result.message}`, { status: 401 });
    }

    if (!result.user ) {
        return ApiResponse.error("inv", { status: 401 });
      }

    if (result.user.role !== "ASSISTANT") {
      return ApiResponse.error("non assis", { status: 401 });
    }

    // Étape 3: Générer un token JWT avec les informations de l'assistant
    const token = sign(
      {
        id: result.user.id,
        email: result.user.email,
        name: result.user.nom,
        role: result.user.role,
        image: result.user.image ?? null,
      },
      process.env.NEXTAUTH_SECRET!, // Secret pour la signature du token
      { expiresIn: "7d" }
    );

    // Étape 4: Définir le token dans le cookie pour l'authentification
    const response = NextResponse.json({ user: result.user });

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // Expire après 7 jours
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la connexion de l'assistant:", error);
    return ApiResponse.serverError("Erreur interne lors de la connexion");
  }
}
