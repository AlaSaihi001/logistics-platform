import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role

    let notifications

    if (role === "CLIENT") {
      // Client can only see their own notifications
      notifications = await prisma.notification.findMany({
        where: { clientId: userId },
        orderBy: { dateEmission: "desc" },
      })
    } else if (role === "ASSISTANT") {
      // Assistant can see their own notifications
      notifications = await prisma.notification.findMany({
        where: { assistantId: userId },
        orderBy: { dateEmission: "desc" },
      })
    } else {
      return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
    }

    return Response.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const body = await req.json()

    if (body.markAllAsRead) {
      // Mark all notifications as read
      if (role === "CLIENT") {
        await prisma.notification.updateMany({
          where: { clientId: userId },
          data: { lu: true },
        })
      } else if (role === "ASSISTANT") {
        await prisma.notification.updateMany({
          where: { assistantId: userId },
          data: { lu: true },
        })
      } else {
        return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
      }

      return Response.json({ success: true })
    } else if (body.id) {
      // Mark a specific notification as read
      const notificationId = Number.parseInt(body.id)

      // Check if the notification exists and belongs to the user
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      })

      if (!notification) {
        return Response.json({ error: "Notification non trouvée" }, { status: 404 })
      }

      if (
        (role === "CLIENT" && notification.clientId !== userId) ||
        (role === "ASSISTANT" && notification.assistantId !== userId)
      ) {
        return Response.json({ error: "Non autorisé" }, { status: 403 })
      }

      // Update the notification
      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { lu: true },
      })

      return Response.json(updatedNotification)
    } else {
      return Response.json({ error: "Paramètres invalides" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating notifications:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const role = session.user.role
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (id) {
      // Delete a specific notification
      const notificationId = Number.parseInt(id)

      // Check if the notification exists and belongs to the user
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      })

      if (!notification) {
        return Response.json({ error: "Notification non trouvée" }, { status: 404 })
      }

      if (
        (role === "CLIENT" && notification.clientId !== userId) ||
        (role === "ASSISTANT" && notification.assistantId !== userId)
      ) {
        return Response.json({ error: "Non autorisé" }, { status: 403 })
      }

      // Delete the notification
      await prisma.notification.delete({
        where: { id: notificationId },
      })

      return Response.json({ success: true })
    } else {
      // Delete all notifications
      if (role === "CLIENT") {
        await prisma.notification.deleteMany({
          where: { clientId: userId },
        })
      } else if (role === "ASSISTANT") {
        await prisma.notification.deleteMany({
          where: { assistantId: userId },
        })
      } else {
        return Response.json({ error: "Rôle non autorisé" }, { status: 403 })
      }

      return Response.json({ success: true })
    }
  } catch (error) {
    console.error("Error deleting notifications:", error)
    return Response.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
