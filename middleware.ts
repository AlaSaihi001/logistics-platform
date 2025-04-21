import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"

// Routes publiques (pas besoin d'authentification)
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/agent/login",
  "/auth/assistant/login",
  "/auth/admin/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/error",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/agent-login",
  "/api/auth/assistant-login",
  "/api/auth/admin-login",
  "/api/auth/logout",
  "/api/auth/me", // si tu l'utilises aussi
]

// Dashboards sécurisés par rôle
const rolePathMap = {
  CLIENT: "/dashboard/client",
  AGENT: "/dashboard/agent",
  ASSISTANT: "/dashboard/assistant",
  ADMIN: "/dashboard/admin",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔒 Ignore les appels aux routes API
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // ✅ Laisser passer les routes publiques
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next()
  }

  // 🔍 Extraire l'utilisateur via le token JWT
  const user = await getUserFromToken(request)

  // ❌ Si l'utilisateur n'est pas connecté, redirection vers login
  if (!user) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // 🔐 Vérifier que l'utilisateur accède bien à son propre dashboard
  const userRole = user.role as keyof typeof rolePathMap
  for (const [role, pathPrefix] of Object.entries(rolePathMap)) {
    if (pathname.startsWith(pathPrefix) && role !== userRole) {
      const url = new URL("/auth/unauthorized", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// ✅ Appliquer le middleware à toutes les routes sauf fichiers statiques
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
