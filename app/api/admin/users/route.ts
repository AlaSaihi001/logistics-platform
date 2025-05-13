import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils"; // Import the new function
import prisma from "@/lib/prisma"; // Prisma Client


import bcrypt from "bcryptjs"; // For hashing the password

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const decoded = await getUserFromToken(req); // Get the user from the token

    if (!decoded) {
      return NextResponse.json({ error: "Token missing or invalid" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Parse the request body to get the user data
    const body = await req.json();
    const { firstName, lastName, email, phone, password, userType, sendCredentials } = body;

    // Validate input data (basic checks)
    if (!firstName || !lastName || !email || !phone || !password || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the user already exists (email should be unique)
    const existingUser = await prisma[userType].findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma[userType].create({
      data: {
        nom: firstName,
        prenom: lastName,
        email,
        telephone: phone,
        motDePasse: hashedPassword, // Store hashed password
        role: userType.toUpperCase(), // Ensure user role is uppercase
      },
    });

    // Optionally, send credentials to the user via email (implement email logic if required)
    if (sendCredentials) {
      console.log("Send credentials to:", email);
      // Implement actual email sending logic here
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// GET /api/admin/users - Get all users
export async function GET(req: NextRequest) {
  try {
    const decoded = await getUserFromToken(req); // Get user from the token

    if (!decoded) {
      return NextResponse.json({ error: "Token missing or invalid" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause based on query parameters
    const where: any = {};
    if (type && type !== "all") where.role = type.toUpperCase();

    // Fetch users from all relevant tables (client, agent, assistant, admin)
    const [clients, agents, assistants, admins] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          createdAt: true,
        },
      }),
      prisma.agent.findMany({
        where,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          createdAt: true,
        },
      }),
      prisma.assistant.findMany({
        where,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          createdAt: true,
        },
      }),
      prisma.administrateur.findMany({
        where,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          createdAt: true,
        },
      }),
    ]);

    console.log(clients, agents, assistants, admins); // Log fetched data

    // Format users into a single array
    const formattedUsers = [
      ...clients.map((client) => ({
        id: `CLI-${client.id}`,
        nom: `${client.prenom} ${client.nom}`,
        email: client.email,
        telephone: client.telephone,
        type: "client",
        dateInscription: new Date(client.createdAt).toLocaleDateString("fr-FR"),
      })),
      ...agents.map((agent) => ({
        id: `AGT-${agent.id}`,
        nom: `${agent.prenom} ${agent.nom}`,
        email: agent.email,
        telephone: agent.telephone,
        type: "agent",
        dateInscription: new Date(agent.createdAt).toLocaleDateString("fr-FR"),
      })),
      ...assistants.map((assistant) => ({
        id: `AST-${assistant.id}`,
        nom: `${assistant.prenom} ${assistant.nom}`,
        email: assistant.email,
        telephone: assistant.telephone,
        type: "assistant",
        dateInscription: new Date(assistant.createdAt).toLocaleDateString("fr-FR"),
      })),
      ...admins.map((admin) => ({
        id: `ADM-${admin.id}`,
        nom: `${admin.prenom} ${admin.nom}`,
        email: admin.email,
        telephone: admin.telephone,
        type: "admin",
        dateInscription: new Date(admin.createdAt).toLocaleDateString("fr-FR"),
      })),
    ];

    // Apply pagination
    const paginatedUsers = formattedUsers.slice(skip, skip + limit);
    const total = formattedUsers.length;

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

