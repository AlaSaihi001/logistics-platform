import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/jwt-utils"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)

    // Get the count of unread notifications for the client
    const count = await prisma.notification.count({
      where: {
        clientId: clientId,
        lu: false, // Only count unread notifications
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching notification count:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
