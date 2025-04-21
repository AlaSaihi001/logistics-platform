import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/jwt-utils"
import { AgentService } from "@/lib/agent-service"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "AGENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const documentId = Number.parseInt(params.id)
    const result = await AgentService.telechargerDocument(documentId)

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Erreur inconnue" }, { status: 400 })
    }

    return NextResponse.json({ documentUrl: result.documentUrl })
  } catch (error) {
    console.error(`Error in GET /api/agent/documents/${params.id}:`, error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
