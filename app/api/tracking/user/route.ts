import { type NextRequest, NextResponse } from "next/server"
import { trackUserLogin } from "@/lib/tracking"

export async function POST(request: NextRequest) {
  try {
    console.log("👤 API /tracking/user chamada")

    const { sessionId, userData } = await request.json()

    if (!sessionId || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos",
        },
        { status: 400 },
      )
    }

    console.log("📊 Dados recebidos:", { sessionId, userData })

    const user = await trackUserLogin(sessionId, userData)
    console.log("✅ Usuário registrado com sucesso:", user)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("❌ Erro ao fazer tracking do usuário:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
