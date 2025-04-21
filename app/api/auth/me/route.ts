import { getUserFromToken } from "@/lib/jwt-utils"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req)

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  return NextResponse.json({ user })
}
