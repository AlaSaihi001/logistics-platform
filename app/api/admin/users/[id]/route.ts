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

// GET /api/admin/users/[id] - Get user details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]; // Get the token from Authorization header

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    // Verify the JWT token and cast it to JwtPayload
    // const decoded = verifyToken(token);

    // Check if the user is an admin
    // if (decoded.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    // }

    const userId = params.id;

    // Extract user type and ID from the combined ID
    const [userType, idStr] = userId.split("-");
    const id = Number.parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    // Get user details based on type
    let user;
    let userRole;

    switch (userType) {
      case "CLI":
        user = await prisma.client.findUnique({
          where: { id },
        });
        userRole = "client";
        break;
      case "AGT":
        user = await prisma.agent.findUnique({
          where: { id },
        });
        userRole = "agent";
        break;
      case "AST":
        user = await prisma.assistant.findUnique({
          where: { id },
        });
        userRole = "assistant";
        break;
      case "ADM":
        user = await prisma.administrateur.findUnique({
          where: { id },
        });
        userRole = "admin";
        break;
      default:
        return NextResponse.json(
          { error: "Type d'utilisateur invalide" },
          { status: 400 }
        );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Format user data
    const formattedUser = {
      id: userId,
      nom: `${user.prenom} ${user.nom}`,
      prenom: user.prenom,
      nomFamille: user.nom,
      email: user.email,
      indicatifPaysTelephone: user.indicatifPaysTelephone,
      telephone: user.telephone,
      type: userRole,
      dateInscription: new Date(user.createdAt).toLocaleDateString("fr-FR"),
      image: user.image,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


// PUT /api/admin/users/[id] - Update user details
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const userId = params.id;
    const [userType, idStr] = userId.split("-");
    const id = Number.parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await req.json();

    // Construction des données à mettre à jour
    const updateData: any = {
      prenom: body.prenom,
      nom: body.nomFamille,
      email: body.email,
      adresse: body.adresse,
      indicatifPaysTelephone: body.indicatifPaysTelephone,
      telephone: body.telephone,
      image: body.image,
    };

    let updatedUser;

    switch (userType) {
      case "CLI":
        updatedUser = await prisma.client.update({
          where: { id },
          data: updateData,
        });
        break;
      case "AGT":
        updatedUser = await prisma.agent.update({
          where: { id },
          data: updateData,
        });
        break;
      case "AST":
        updatedUser = await prisma.assistant.update({
          where: { id },
          data: updateData,
        });
        break;
      case "ADM":
        updatedUser = await prisma.administrateur.update({
          where: { id },
          data: updateData,
        });
        break;
      default:
        return NextResponse.json({ error: "Type d'utilisateur invalide" }, { status: 400 });
    }

    return NextResponse.json({ message: "Utilisateur mis à jour", user: updatedUser });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
