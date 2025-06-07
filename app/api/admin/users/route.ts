import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils"; // Import the new function
import prisma from "@/lib/prisma"; // Prisma Client

import bcrypt from "bcryptjs"; // For hashing the password

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const decoded = await getUserFromToken(req); // Get the user from the token

    if (!decoded) {
      return NextResponse.json(
        { error: "Token missing or invalid" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Parse the request body to get the user data
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      numericPhone,
      indicatifPaysTelephone,
      password,
      userType,
      sendCredentials,
      address,
    } = body;
    console.log(body);
    // Validate input data (basic checks)
    if (
      !firstName ||
      !lastName ||
      !email ||
      !numericPhone ||
      !password ||
      !userType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the user already exists (email should be unique)
    const existingUser = await prisma[userType].findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma[userType].create({
      data: {
        nom: firstName,
        prenom: lastName,
        email,
        indicatifPaysTelephone: indicatifPaysTelephone,
        telephone: numericPhone,
        motDePasse: password, // Store hashed password
        role: userType.toUpperCase(),
        adresse: address, // Ensure user role is uppercase
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
      return NextResponse.json(
        { error: "Token missing or invalid" },
        { status: 401 }
      );
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
          role: true,
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
          role: true,
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
          role: true,
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
          role: true,
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
        dateInscription: new Date(assistant.createdAt).toLocaleDateString(
          "fr-FR"
        ),
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
      clients: clients,
      admins: admins,
      agents: agents,
      assistants: assistants,
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
// DELETE /api/admin/users - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    const decoded = await getUserFromToken(req);

    if (!decoded) {
      return NextResponse.json(
        { error: "Token missing or invalid" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get userType and userId from query params
    const searchParams = req.nextUrl.searchParams;
    const userType = searchParams.get("userType");
    const userId = searchParams.get("userId");

    if (!userType || !userId) {
      return NextResponse.json(
        { error: "Missing userType or userId" },
        { status: 400 }
      );
    }

    // Parse the actual ID part if prefixed like AGT-123
    const numericId = parseInt(userId.replace(/^\w+-/, ""), 10);

    // Check if the table exists in the schema
    if (
      !["client", "agent", "assistant", "administrateur"].includes(userType)
    ) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    const deletedUser = await prisma[userType].delete({
      where: { id: numericId },
    });

    return NextResponse.json(
      { message: "User deleted successfully", user: deletedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// PATCH /api/admin/users - Update an existing user
export async function PUT(req: NextRequest) {
  try {
    const decoded = await getUserFromToken(req);

    if (!decoded) {
      return NextResponse.json(
        { error: "Token missing or invalid" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      firstName,
      lastName,
      email,
      numericPhone,
      indicatifPaysTelephone,
      userType,
      address,
    } = body;

    if (
      !id ||
      !firstName ||
      !lastName ||
      !email ||
      !numericPhone ||
      !userType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const numericId = parseInt(id.replace(/^\w+-/, ""), 10);

    const updatedUser = await prisma[userType].update({
      where: { id: numericId },
      data: {
        nom: firstName,
        prenom: lastName,
        email: email,
        indicatifPaysTelephone: indicatifPaysTelephone,
        telephone: numericPhone,
        role: userType.toUpperCase(),
        addresse: address,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
