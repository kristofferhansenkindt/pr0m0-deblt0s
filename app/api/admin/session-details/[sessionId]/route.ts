import { type NextRequest, NextResponse } from "next/server"
import { getSessionDetails } from "@/lib/enhanced-database"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.includes("admin1234554321")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sessionId = params.sessionId
    const sessionDetails = await getSessionDetails(sessionId)

    return NextResponse.json({
      success: true,
      data: sessionDetails,
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes da sessão:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
