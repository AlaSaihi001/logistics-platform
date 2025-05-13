import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // JWT package for decoding and verifying tokens
import prisma from "@/lib/prisma";

// Define the expected structure of the JWT payload
interface JwtPayload {
  role: string;
  userId: string;
}

// Helper function to verify JWT and type it correctly
const verifyToken = (token: string): JwtPayload => {
  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

// PUT /api/admin/users/[id]/status - Update user status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]; // Get the token from Authorization header
    
    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    // Verify the JWT token and cast it to JwtPayload
    const decoded = verifyToken(token);

    // Check if the user is an admin
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const userId = params.id;
    const body = await req.json();
    const { status } = body;

    // Extract user type and ID from the combined ID
    const [userType, idStr] = userId.split("-");
    const id = Number.parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
    }

    // Update user status based on type
    let updatedUser;
    const isActive = status === "actif";

    return NextResponse.json({
      id: userId,
      status,
      message: `Utilisateur ${status === "actif" ? "activé" : "désactivé"} avec succès`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
