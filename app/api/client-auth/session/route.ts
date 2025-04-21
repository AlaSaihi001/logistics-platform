import type { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur de session:", error);
    return new NextResponse(
      JSON.stringify({ error: "Impossible de vérifier la session utilisateur" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
