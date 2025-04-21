import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import { AuthService } from "@/lib/auth-service";
import { ApiResponse } from "@/lib/api-response";
import { rateLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // Lecture du corps de la requête
    const body = await req.json();
    const { email, password } = body;

    console.log("Données de la requête : ", { email, password }); // Ajout de log

    // Validation
    const errors: Record<string, string> = {};
    if (!email) errors.email = "L'email est requis";
    if (!password) errors.password = "Le mot de passe est requis";

    if (Object.keys(errors).length > 0) {
      return ApiResponse.validationError(errors);
    }

    // Authentification
    const result = await AuthService.authenticateUser(email, password);

    if (!result.success || !result.user) {
      console.log("Erreur d'authentification : ", result.error); // Ajout de log pour déboguer l'erreur
      return ApiResponse.error(result.error ?? "Identifiants invalides", { status: 401 });
    }

    // Code pour la création du token et la réponse
    const user = result.user;
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image ?? null,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    // Envoi du cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    // Réponse OK
    return ApiResponse.success({ user });
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return ApiResponse.serverError("Une erreur est survenue lors de la connexion");
  }
}

