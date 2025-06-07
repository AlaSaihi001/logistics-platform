import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function getAdminProfile(adminId: number) {
  try {
    const admin = await prisma.administrateur.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        indicatifPaysTelephone: true,
        image: true,
        createdAt: true,
        adresse: true,
      },
    });
    return admin;
  } catch (error) {
    console.error("Error fetching assistant profile:", error);
    throw new Error("Failed to fetch assistant profile");
  }
}
export async function updateAdminProfile(adminId: number, data: any) {
  try {
    const updatedAdmin = await prisma.administrateur.update({
      where: { id: adminId },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        indicatifPaysTelephone: data.indicatifPaysTelephone,
        image: data.image,
        adresse: data.address,
      },
    });
    return updatedAdmin;
  } catch (error) {
    console.error("Error updating assistant profile:", error);
    throw new Error("Failed to update assistant profile");
  }
}
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const admintId = Number.parseInt(user.id);
    const admin = await getAdminProfile(admintId);

    if (!admin) {
      return NextResponse.json(
        { error: "Assistant non trouvé" },
        { status: 404 }
      );
    }
    console.log(admin);
    return NextResponse.json(admin);
  } catch (error) {
    console.error("Error fetching assistant profile:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await request.json();
    const adminId = Number.parseInt(user.id);
    const updatedAdmin = await updateAdminProfile(adminId, data);

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating assistant profile:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
