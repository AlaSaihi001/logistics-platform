import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { ApiResponse } from "@/lib/api-response"

export async function POST(req: NextRequest) {
  try {
    cookies().delete("auth-token")
    return ApiResponse.success({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return ApiResponse.serverError("Une erreur est survenue lors de la déconnexion")
  }
}
