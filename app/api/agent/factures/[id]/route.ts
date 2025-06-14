import { type NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/jwt-utils";
import { AgentService } from "@/lib/agent-service";
import { ApiResponse } from "@/lib/api-response";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { renderToBuffer, renderToStream } from "@react-pdf/renderer";
import { Bill, InvoicePDF } from "@/pdf/InvoicePDF";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const factureId = Number.parseInt(params.id);
    console.log(factureId);
    const result = await AgentService.getFacture(factureId);
    console.dir(result, { depth: null });
    console.log(result);
    return ApiResponse.success(result);
  } catch (error) {
    console.error(`Error in GET /api/agent/factures/${params.id}:`, error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);

    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    const factureId = Number.parseInt(params.id);
    const { action } = await req.json();

    let result;

    if (action === "telecharger") {
      result = await AgentService.telechargerFacture(factureId);
    } else if (action === "imprimer") {
      result = await AgentService.imprimerFacture(factureId);
    } else if (action === "envoyer") {
      result = await AgentService.envoyerClient(factureId);
    } else if (action === "payer") {
      result = await AgentService.PaidFacture(factureId);
    } else {
      return ApiResponse.error("Action non valide", { status: 400 });
    }

    if (!result.success) {
      return ApiResponse.error(result.error ?? "Action échouée", {
        status: 400,
      });
    }

    return ApiResponse.success(result);
  } catch (error) {
    console.error(`Error in PUT /api/agent/factures/${params.id}:`, error);
    return ApiResponse.serverError("Une erreur est survenue");
  }
}
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const user = await getUserFromToken(request);
    if (!user || user.role !== "AGENT") {
      return ApiResponse.unauthorized();
    }

    // Parse request body
    const billData = await request.json();
    const AgentId = Number.parseInt(user.id);
    const commandId = Number.parseInt(params.id);
    // Generate PDF
    const completeBillData: Bill = {
      idClient: billData.clientId,
      idCommande: commandId.toString(),
      montant: billData.montant,
      idAgent: AgentId.toString(),
      dateEmission: new Date(),
      numeroFacture: Math.floor(Math.random() * 1000000),
      status: billData.status,
    };
    console.log("Complete Bill DATA", completeBillData);
    // Explicit component creation with type assertion
    const pdfStream = await renderToStream(InvoicePDF(completeBillData));
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      pdfStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdfStream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // File handling
    const docsDir = path.join(process.cwd(), "public/factures");
    const fileName = `facture_${uuidv4()}.pdf`;
    const filePath = path.join(docsDir, fileName);

    // Ensure directory exists
    await fs.mkdir(docsDir, { recursive: true });

    // Save PDF file
    await fs.writeFile(filePath, pdfBuffer);
    const fileUrl = `/factures/${fileName}`;

    // Create bill in database
    const newBill = await AgentService.createFactures(
      AgentId,
      billData.clientId,
      commandId,
      fileUrl,
      billData.montant,
      billData.status
    );
    console.log(newBill);
    return ApiResponse.success({
      ...newBill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    return ApiResponse.serverError(
      "Une erreur est survenue lors de la création de la facture"
    );
  }
}
