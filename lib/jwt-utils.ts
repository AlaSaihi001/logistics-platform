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
  const token = req.cookies.get("auth-token")?.value; // ⬅️ الفرق هنا مهم
console.log(token)
  if (!token) return null;

  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as UserToken;
    console.log("decoded token",decoded)
    return decoded;
  } catch (err) {
    console.error("Token invalid or expired:", err);
    return null;
  }
}
