import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import {
  getAssistantNotifications,
  markNotificationAsRead,
} from "@/lib/assistant-service"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const assistantId = Number.parseInt(user.id)
    const notifications = await getAssistantNotifications(assistantId)

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching assistant notifications:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des notifications" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (user.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la notification est requis" },
        { status: 400 }
      )
    }

    const result = await markNotificationAsRead(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du marquage de la notification comme lue" },
      { status: 500 }
    )
  }
}
