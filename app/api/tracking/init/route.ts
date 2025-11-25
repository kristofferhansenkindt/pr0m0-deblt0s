import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { createSession } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 API /tracking/init chamada")

    // Gera um ID de sessão único
    const sessionId = uuidv4()
    console.log("🆔 Novo sessionId gerado:", sessionId)

    // Obtém o IP do cliente
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    // Obtém o User-Agent
    const userAgent = request.headers.get("user-agent") || "Unknown"

    // Obtém os parâmetros UTM
    const { utmParams } = await request.json()
    console.log("📊 UTM params:", utmParams)

    // Faz geolocalização por IP (apenas se não for localhost)
    let geoData = {}
    if (ipAddress !== "127.0.0.1" && ipAddress !== "localhost") {
      try {
        console.log("🌍 Fazendo geolocalização para IP:", ipAddress)
        const geoResponse = await fetch(
          `http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,lat,lon,timezone,isp,query`,
        )

        if (geoResponse.ok) {
          const geoResult = await geoResponse.json()
          console.log("📍 Dados geográficos obtidos:", geoResult)

          if (geoResult.status === "success") {
            geoData = {
              country: geoResult.country,
              region: geoResult.regionName,
              city: geoResult.city,
              latitude: geoResult.lat,
              longitude: geoResult.lon,
              timezone: geoResult.timezone,
              isp: geoResult.isp,
            }
          }
        }
      } catch (geoError) {
        console.warn("⚠️ Erro na geolocalização:", geoError)
      }
    } else {
      console.log("🏠 IP local detectado, usando dados padrão")
      geoData = {
        country: "Brazil",
        region: "São Paulo",
        city: "São Paulo",
        latitude: -23.5505,
        longitude: -46.6333,
        timezone: "America/Sao_Paulo",
        isp: "Local Network",
      }
    }

    // Cria a sessão no banco de dados
    await createSession({
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      country: geoData.country,
      region: geoData.region,
      city: geoData.city,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      utm_content: utmParams?.utm_content,
      utm_term: utmParams?.utm_term,
    })

    console.log("✅ Sessão criada com sucesso")

    return NextResponse.json({
      success: true,
      sessionId,
      geoData,
    })
  } catch (error) {
    console.error("❌ Erro ao inicializar tracking:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
