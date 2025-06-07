import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { AuthService } from "@/lib/auth-service";
import { ApiResponse } from "@/lib/api-response";
// import { rateLimiter } from "@/lib/rate-limiter"

export async function POST(req: NextRequest) {
  try {
    // 1. Anti-bruteforce : désactivé temporairement
    // const rateLimit = await rateLimiter(req, undefined, 3, 60)
    // if (rateLimit) return rateLimit

    // 2. Extraire les données du body
    const body = await req.json();
    console.log("📥 Données reçues à l’inscription :", body);

    const {
      email,
      password,
      confirmPassword,
      nom,
      prenom,
      telephone,
      indicatifTelephone,
      adresse,
    } = body;

    // 3. Valider les données
    const errors: Record<string, string> = {};

    if (!email) errors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "L'email n'est pas valide";

    if (!password) errors.password = "Le mot de passe est requis";
    else if (password.length < 8)
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";

    if (!confirmPassword) errors.confirmPassword = "Confirmation requise";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Les mots de passe ne correspondent pas";

    if (!nom) errors.nom = "Nom requis";
    if (!prenom) errors.prenom = "Prénom requis";

    if (!telephone) errors.telephone = "Téléphone requis";
    else if (!/^\d+$/.test(telephone))
      errors.telephone =
        "Le numéro de téléphone doit être composé uniquement de chiffres";

    if (!indicatifTelephone)
      errors.indicatifTelephone = "L'indicatif téléphonique est requis";

    if (Object.keys(errors).length > 0) {
      console.log("⛔ Erreurs de validation :", errors); // 👈 log pour debug
      return ApiResponse.validationError(errors);
    }

    // 4. Enregistrer l'utilisateur
    try {
      console.log("🚀 Tentative d'enregistrement avec :", {
        email,
        nom,
        prenom,
        telephone,
        indicatifTelephone,
      });

      const result = await AuthService.registerUser({
        email,
        password,
        nom,
        prenom,
        telephone,
        indicatifTelephone,
        adresse,
      });

      if (!result.success || !result.user) {
        console.log("❌ Échec de l'enregistrement :", result.error);
        return ApiResponse.error(result.error ?? "Erreur inconnue", {
          status: 400,
        });
      }

      const user = result.user;

      // 5. Générer le JWT
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

      // 6. Réponse et cookie
      const response = NextResponse.json({ user });

      response.cookies.set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        sameSite: "lax",
      });

      console.log("✅ Enregistrement réussi pour :", user.email);
      return response;
    } catch (err) {
      console.error("🔥 Erreur interne dans AuthService.registerUser:", err);
      return ApiResponse.serverError(
        "Erreur interne lors de la création du compte"
      );
    }
  } catch (error) {
    console.error("❌ Erreur globale d'inscription :", error);
    return ApiResponse.serverError("Erreur lors de l'inscription");
  }
}
