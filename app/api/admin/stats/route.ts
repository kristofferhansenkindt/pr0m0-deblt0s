import { type NextRequest, NextResponse } from "next/server"
import {
  getDashboardStats,
  getRecentSessions,
  getSessionsByCountry,
  getSessionsByStep,
  getSessionsOverTime,
} from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔧 API /admin/stats chamada")

    // Verifica autenticação (simplificada para este exemplo)
    const authHeader = request.headers.get("authorization")
    console.log("🔐 Auth header:", authHeader)

    if (authHeader !== "Bearer admin1234554321") {
      console.error("❌ Não autorizado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log("✅ Autenticação válida, buscando dados...")

    try {
      const [stats, recentSessions, sessionsByCountry, sessionsByStep, sessionsOverTime] = await Promise.all([
        getDashboardStats(),
        getRecentSessions(100),
        getSessionsByCountry(),
        getSessionsByStep(),
        getSessionsOverTime(),
      ])

      console.log("📊 Dados obtidos:", {
        stats,
        recentSessionsCount: recentSessions.length,
        sessionsByCountryCount: sessionsByCountry.length,
        sessionsByStepCount: sessionsByStep.length,
        sessionsOverTimeCount: sessionsOverTime.length,
      })

      return NextResponse.json({
        success: true,
        data: {
          stats,
          recentSessions,
          sessionsByCountry,
          sessionsByStep,
          sessionsOverTime,
        },
      })
    } catch (dbError) {
      console.error("❌ Erro no banco de dados:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${dbError.message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Erro geral na API admin/stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
