import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import prisma from "@/lib/prisma"
import { ClientService } from "@/lib/client-service"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)

    // Récupérer les notifications du client
    const notifications = await ClientService.recevoirNotifications(clientId)

    return Response.json(notifications)
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = Number.parseInt(user.id)
    const body = await req.json()

    if (body.markAllAsRead) {
      // Tout marquer comme lu
      await prisma.notification.updateMany({
        where: { clientId },
        data: { lu: true },
      })

      return Response.json({ success: true })
    } else if (body.id) {
      const notificationId = Number.parseInt(body.id)

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      })

      if (!notification) {
        return Response.json({ error: "Notification non trouvée" }, { status: 404 })
      }

      if (notification.clientId !== clientId) {
        return Response.json({ error: "Non autorisé" }, { status: 403 })
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { lu: true },
      })

      return Response.json(updatedNotification)
    } else {
      return Response.json({ error: "Paramètres invalides" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
