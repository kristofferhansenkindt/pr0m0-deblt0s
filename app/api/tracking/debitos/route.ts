import { type NextRequest, NextResponse } from "next/server"
import { trackDebitos } from "@/lib/tracking"

export async function POST(request: NextRequest) {
  try {
    console.log("💰 API /tracking/debitos chamada")

    const { sessionId, userId, debitos } = await request.json()

    if (!sessionId || !userId || !debitos || !Array.isArray(debitos)) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos",
        },
        { status: 400 },
      )
    }

    console.log("📊 Dados recebidos:", { sessionId, userId, debitos: debitos.length })

    await trackDebitos(sessionId, userId, debitos)
    console.log("✅ Débitos registrados com sucesso")

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("❌ Erro ao fazer tracking de débitos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
