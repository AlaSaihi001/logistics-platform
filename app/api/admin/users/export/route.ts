import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { stringify } from "csv-stringify/sync"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { filters } = body

    // Build where clauses for each user type
    const whereClient: any = {}
    const whereAgent: any = {}
    const whereAssistant: any = {}
    const whereAdmin: any = {}

    if (filters?.status) {
      const isActive = filters.status === "actif"
      whereClient.active = isActive
      whereAgent.active = isActive
      whereAssistant.active = isActive
      whereAdmin.active = isActive
    }

    // Get users based on type filter
    let clients = []
    let agents = []
    let assistants = []
    let admins = []

    if (!filters?.type || filters.type === "client") {
      clients = await prisma.client.findMany({
        where: whereClient,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          createdAt: true,
          active: true,
        },
      })
    }

    if (!filters?.type || filters.type === "agent") {
      agents = await prisma.agent.findMany({
        where: whereAgent,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          createdAt: true,
          active: true,
        },
      })
    }

    if (!filters?.type || filters.type === "assistant") {
      assistants = await prisma.assistant.findMany({
        where: whereAssistant,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          createdAt: true,
          active: true,
        },
      })
    }

    if (!filters?.type || filters.type === "admin") {
      admins = await prisma.admin.findMany({
        where: whereAdmin,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          createdAt: true,
          active: true,
        },
      })
    }

    // Format users for CSV
    const formattedUsers = [
      ...clients.map((client) => ({
        ID: `CLI-${client.id}`,
        Type: "Client",
        Prénom: client.prenom,
        Nom: client.nom,
        Email: client.email,
        Téléphone: `${client.indicatifPaysTelephone} ${client.telephone}`,
        "Date d'inscription": new Date(client.createdAt).toLocaleDateString("fr-FR"),
        Statut: client.active ? "Actif" : "Inactif",
      })),
      ...agents.map((agent) => ({
        ID: `AGT-${agent.id}`,
        Type: "Agent",
        Prénom: agent.prenom,
        Nom: agent.nom,
        Email: agent.email,
        Téléphone: `${agent.indicatifPaysTelephone} ${agent.telephone}`,
        "Date d'inscription": new Date(agent.createdAt).toLocaleDateString("fr-FR"),
        Statut: agent.active ? "Actif" : "Inactif",
      })),
      ...assistants.map((assistant) => ({
        ID: `AST-${assistant.id}`,
        Type: "Assistant",
        Prénom: assistant.prenom,
        Nom: assistant.nom,
        Email: assistant.email,
        Téléphone: `${assistant.indicatifPaysTelephone} ${assistant.telephone}`,
        "Date d'inscription": new Date(assistant.createdAt).toLocaleDateString("fr-FR"),
        Statut: assistant.active ? "Actif" : "Inactif",
      })),
      ...admins.map((admin) => ({
        ID: `ADM-${admin.id}`,
        Type: "Administrateur",
        Prénom: admin.prenom,
        Nom: admin.nom,
        Email: admin.email,
        Téléphone: `${admin.indicatifPaysTelephone} ${admin.telephone}`,
        "Date d'inscription": new Date(admin.createdAt).toLocaleDateString("fr-FR"),
        Statut: admin.active ? "Actif" : "Inactif",
      })),
    ]

    // Apply search filter if provided
    let filteredUsers = formattedUsers
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredUsers = formattedUsers.filter(
        (user) =>
          user.ID.toLowerCase().includes(searchTerm) ||
          user.Prénom.toLowerCase().includes(searchTerm) ||
          user.Nom.toLowerCase().includes(searchTerm) ||
          user.Email.toLowerCase().includes(searchTerm) ||
          user.Téléphone.toLowerCase().includes(searchTerm),
      )
    }

    // Generate CSV
    const csv = stringify(filteredUsers, {
      header: true,
      columns: ["ID", "Type", "Prénom", "Nom", "Email", "Téléphone", "Date d'inscription", "Statut"],
    })

    // Return CSV as a blob
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="utilisateurs-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting users:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
