import { type NextRequest, NextResponse } from "next/server"
import { getEnhancedCampaignAnalytics } from "@/lib/enhanced-database"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.includes("admin1234554321")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const campaignAnalytics = await getEnhancedCampaignAnalytics()

    return NextResponse.json({
      success: true,
      data: campaignAnalytics,
    })
  } catch (error) {
    console.error("Erro ao buscar análise de campanhas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
