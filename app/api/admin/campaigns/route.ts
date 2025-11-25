import { type NextRequest, NextResponse } from "next/server"
import { getCampaignStats, getTopPerformingCampaigns } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 API /admin/campaigns chamada")

    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.includes("admin1234554321")) {
      console.warn("❌ Acesso negado - token inválido")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ Autenticação válida")

    // Buscar dados de campanhas
    const campaignStats = await getCampaignStats()
    console.log("📈 Stats de campanhas obtidas:", {
      sources: campaignStats.campaignsBySource?.length,
      campaigns: campaignStats.campaignsByName?.length,
      content: campaignStats.campaignsByContent?.length,
    })

    // Buscar top campanhas (sem limite mínimo para debug)
    const topCampaigns = await getTopPerformingCampaigns(50)
    console.log("🏆 Top campanhas obtidas:", topCampaigns.length)

    const responseData = {
      success: true,
      data: {
        ...campaignStats,
        topCampaigns,
      },
    }

    console.log("✅ Dados de campanhas retornados com sucesso")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ Erro na API de campanhas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
