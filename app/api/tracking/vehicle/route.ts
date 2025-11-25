import { type NextRequest, NextResponse } from "next/server"
import { trackPlacaConsulta } from "@/lib/tracking"

export async function POST(request: NextRequest) {
  try {
    console.log("🚗 API /tracking/vehicle chamada")

    const { sessionId, userId, vehicleData } = await request.json()

    if (!sessionId || !userId || !vehicleData) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos",
        },
        { status: 400 },
      )
    }

    console.log("📊 Dados recebidos:", { sessionId, userId, vehicleData })

    await trackPlacaConsulta(sessionId, userId, vehicleData)
    console.log("✅ Veículo registrado com sucesso")

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("❌ Erro ao fazer tracking do veículo:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
