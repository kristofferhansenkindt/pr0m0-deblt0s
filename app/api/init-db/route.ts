import { NextResponse } from "next/server"
import { initDatabase } from "@/scripts/init-database"

export async function POST() {
  try {
    await initDatabase()

    return NextResponse.json({
      success: true,
      message: "Banco de dados inicializado com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao inicializar banco:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
