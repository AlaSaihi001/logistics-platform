import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { AgentService } from "@/lib/agent-service";
import { ApiResponse } from "@/lib/api-response";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }
    const agentId = Number(user.id);
    const commandeId = parseInt(context.params.id); // ✅ FIX HERE
    const documents = await AgentService.gererDocuments(agentId, commandeId);

    if (!documents) {
      return ApiResponse.notFound("Commande non trouvée");
    }
    console.log(documents);
    return ApiResponse.success(documents);
  } catch (error) {
    console.error("Error fetching commande details:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la récupération des détails de la commande"
    );
  }
}
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const formData = await request.formData();
    const nom = formData.get("nom") as string;
    const type = formData.get("type") as string;
    const file = formData.get("fichier") as File;

    if (!nom || !type || !file) {
      return ApiResponse.error("Champs requis manquants");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename
    const extension = path.extname(file.name);
    const fileName = `${uuidv4()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const uploadPath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file to disk
    await fs.writeFile(uploadPath, buffer);

    // File accessible at this URL (if using Next.js static serving)
    const url = `/uploads/${fileName}`;
    const size = file.size;
    const agentId = Number(user.id);
    const commandeId = Number.parseInt(params.id);
    // Call your service method to store in DB
    const result = await AgentService.ajouterDocument(
      commandeId,
      agentId,
      nom,
      size,
      url,
      type
    );

    return ApiResponse.success(result);
  } catch (error) {
    console.error("Error adding document:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de l'ajout du document"
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }
    const DocId = Number.parseInt(params.id);
    const result = await AgentService.supprimerDocument(DocId);
    return ApiResponse.success(result);
  } catch (error) {
    console.error("Error Deleting document:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la suppression du document"
    );
  }
}
