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
    const rateLimit = await rateLimiter(req, ip, 5, 60);
    if (rateLimit) return rateLimit;

    const body = await req.json();
    const { email, password } = body;

    // Vérification des champs requis
    if (!email || !password) {
      return ApiResponse.validationError({
        email: !email ? "Email requis" : "",
        password: !password ? "Mot de passe requis" : "",
      });
    }

    // Recherche de l'admin
    const admin = await prisma.administrateur.findUnique({ where: { email } });
    if (!admin) {
      return ApiResponse.error("Identifiants invalides", { status: 401 });
    }

    // Vérification du mot de passe
    const match = await compare(password, admin.motDePasse);
    if (!match) {
      return ApiResponse.error("Identifiants invalides", { status: 401 });
    }

    // Génération du token
    const token = sign(
      {
        id: admin.id,
        email: admin.email,
        name: `${admin.prenom} ${admin.nom}`,
        role: admin.role,
        image: admin.image ?? null,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1d" }
    );

    // Création de la réponse + cookie
    const response = NextResponse.json({
      user: {
        id: admin.id,
        email: admin.email,
        name: `${admin.prenom} ${admin.nom}`,
        role: admin.role,
        image: admin.image ?? null,
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
    console.error("Admin login error:", error);
    return ApiResponse.serverError("Erreur lors de la connexion administrateur");
  }
}
