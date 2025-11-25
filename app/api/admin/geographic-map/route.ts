import { type NextRequest, NextResponse } from "next/server"
import { getGeographicMapData } from "@/lib/enhanced-database"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.includes("admin1234554321")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const mapData = await getGeographicMapData()

    return NextResponse.json({
      success: true,
      data: mapData,
    })
  } catch (error) {
    console.error("Erro ao buscar dados do mapa:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
