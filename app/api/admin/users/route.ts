import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/admin/users - Get all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (type) {
      where.type = type.toUpperCase()
    }
    if (status) {
      where.status = status === "actif" ? true : false
    }

    // Get users from all tables (client, agent, assistant, admin)
    const [clients, agents, assistants, admins] = await Promise.all([
      prisma.client.findMany({
        where: {
          ...where,
          type: where.type ? (where.type === "CLIENT" ? {} : { not: {} }) : {},
          active: where.status !== undefined ? where.status : {},
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          image: true,
          createdAt: true,
          active: true,
        },
      }),
      prisma.agent.findMany({
        where: {
          ...where,
          type: where.type ? (where.type === "AGENT" ? {} : { not: {} }) : {},
          active: where.status !== undefined ? where.status : {},
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          image: true,
          createdAt: true,
          active: true,
        },
      }),
      prisma.assistant.findMany({
        where: {
          ...where,
          type: where.type ? (where.type === "ASSISTANT" ? {} : { not: {} }) : {},
          active: where.status !== undefined ? where.status : {},
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          image: true,
          createdAt: true,
          active: true,
        },
      }),
      prisma.admin.findMany({
        where: {
          ...where,
          type: where.type ? (where.type === "ADMIN" ? {} : { not: {} }) : {},
          active: where.status !== undefined ? where.status : {},
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          indicatifPaysTelephone: true,
          image: true,
          createdAt: true,
          active: true,
        },
      }),
    ])

    // Format users
    const formattedUsers = [
      ...clients.map((client) => ({
        id: `CLI-${client.id}`,
        nom: `${client.prenom} ${client.nom}`,
        email: client.email,
        telephone: `${client.indicatifPaysTelephone} ${client.telephone}`,
        type: "client" as const,
        dateInscription: new Date(client.createdAt).toLocaleDateString("fr-FR"),
        statut: client.active ? ("actif" as const) : ("inactif" as const),
        image: client.image,
      })),
      ...agents.map((agent) => ({
        id: `AGT-${agent.id}`,
        nom: `${agent.prenom} ${agent.nom}`,
        email: agent.email,
        telephone: `${agent.indicatifPaysTelephone} ${agent.telephone}`,
        type: "agent" as const,
        dateInscription: new Date(agent.createdAt).toLocaleDateString("fr-FR"),
        statut: agent.active ? ("actif" as const) : ("inactif" as const),
        image: agent.image,
      })),
      ...assistants.map((assistant) => ({
        id: `AST-${assistant.id}`,
        nom: `${assistant.prenom} ${assistant.nom}`,
        email: assistant.email,
        telephone: `${assistant.indicatifPaysTelephone} ${assistant.telephone}`,
        type: "assistant" as const,
        dateInscription: new Date(assistant.createdAt).toLocaleDateString("fr-FR"),
        statut: assistant.active ? ("actif" as const) : ("inactif" as const),
        image: assistant.image,
      })),
      ...admins.map((admin) => ({
        id: `ADM-${admin.id}`,
        nom: `${admin.prenom} ${admin.nom}`,
        email: admin.email,
        telephone: `${admin.indicatifPaysTelephone} ${admin.telephone}`,
        type: "admin" as const,
        dateInscription: new Date(admin.createdAt).toLocaleDateString("fr-FR"),
        statut: admin.active ? ("actif" as const) : ("inactif" as const),
        image: admin.image,
      })),
    ]

    // Apply pagination
    const paginatedUsers = formattedUsers.slice(skip, skip + limit)
    const total = formattedUsers.length

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { type, nom, prenom, email, telephone, indicatifPaysTelephone, motDePasse } = body

    // Validate required fields
    if (!type || !nom || !prenom || !email || !telephone || !indicatifPaysTelephone || !motDePasse) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    // Check if email already exists in any user table
    const existingUser = await Promise.all([
      prisma.client.findUnique({ where: { email } }),
      prisma.agent.findUnique({ where: { email } }),
      prisma.assistant.findUnique({ where: { email } }),
      prisma.admin.findUnique({ where: { email } }),
    ])

    if (existingUser.some((user) => user !== null)) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    // Create user based on type
    let newUser
    switch (type) {
      case "client":
        newUser = await prisma.client.create({
          data: {
            nom,
            prenom,
            email,
            telephone: Number.parseInt(telephone),
            indicatifPaysTelephone,
            motDePasse: await bcrypt.hash(motDePasse, 10),
            active: true,
          },
        })
        break
      case "agent":
        newUser = await prisma.agent.create({
          data: {
            nom,
            prenom,
            email,
            telephone: Number.parseInt(telephone),
            indicatifPaysTelephone,
            motDePasse: await bcrypt.hash(motDePasse, 10),
            active: true,
          },
        })
        break
      case "assistant":
        newUser = await prisma.assistant.create({
          data: {
            nom,
            prenom,
            email,
            telephone: Number.parseInt(telephone),
            indicatifPaysTelephone,
            motDePasse: await bcrypt.hash(motDePasse, 10),
            active: true,
          },
        })
        break
      case "admin":
        newUser = await prisma.admin.create({
          data: {
            nom,
            prenom,
            email,
            telephone: Number.parseInt(telephone),
            indicatifPaysTelephone,
            motDePasse: await bcrypt.hash(motDePasse, 10),
            active: true,
          },
        })
        break
      default:
        return NextResponse.json({ error: "Type d'utilisateur invalide" }, { status: 400 })
    }

    // Remove password from response
    const { motDePasse: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Import bcrypt for password hashing
import bcrypt from "bcrypt"
