import { type NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { rateLimiter } from "@/lib/rate-limiter";
import { ApiResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    // Anti-bruteforce par IP
    const ip = req.ip ?? "127.0.0.1";
    // const rateLimit = await rateLimiter(req, ip, 5, 60);
    // if (rateLimit) return rateLimit;

    const body = await req.json();
    const { email, password } = body;

    // Vérification des champs requis
    if (!email || !password) {
      return ApiResponse.validationError({
        email: !email ? "Email requis" : "",
        password: !password ? "Mot de passe requis" : "",
      });
    }

    // Recherche de l'assistant
    const assistant = await prisma.assistant.findUnique({ where: { email } });
    if (!assistant) {
      return ApiResponse.error("Identifiants invalides", { status: 401 });
    }

    // Vérification du mot de passe
    const match = password === assistant.motDePasse;
    if (!match) {
      return ApiResponse.error("Identifiants invalides", { status: 401 });
    }

    // Génération du token
    const token = sign(
      {
        id: assistant.id,
        email: assistant.email,
        name: `${assistant.prenom} ${assistant.nom}`,
        role: assistant.role,
        image: assistant.image ?? null,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1d" }
    );

    // Création de la réponse + cookie
    const response = NextResponse.json({
      user: {
        id: assistant.id,
        email: assistant.email,
        name: `${assistant.prenom} ${assistant.nom}`,
        role: assistant.role,
        image: assistant.image ?? null,
      },
    });

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 jour
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("assistant login error:", error);
    return ApiResponse.serverError(
      "Erreur lors de la connexion assistantistrateur"
    );
  }
}
