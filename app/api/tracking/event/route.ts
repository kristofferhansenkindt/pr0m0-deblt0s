import { type NextRequest, NextResponse } from "next/server"
import { trackEvent } from "@/lib/tracking"

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 API /tracking/event chamada")

    const { sessionId, eventType, eventData, step } = await request.json()

    if (!sessionId || !eventType) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos",
        },
        { status: 400 },
      )
    }

    console.log("📊 Processando evento:", { sessionId, eventType, step })

    await trackEvent(sessionId, eventType, eventData, step)
    console.log(`✅ Evento ${eventType} processado com sucesso`)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("❌ Erro ao registrar evento:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
