import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import type { NextRequest } from "next/server";

interface UserToken {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
}

export async function getUserFromToken(req: NextRequest): Promise<UserToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as UserToken;
    return decoded;
  } catch (err) {
    console.error("Token invalid or expired:", err);
    return null;
  }
}

export async function signOutCustom() {
  const cookieStore = await cookies()

  // Remove the 'auth-token' cookie
  cookieStore.delete("auth-token", {
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",  // Ensure secure flag is set correctly
  })
}