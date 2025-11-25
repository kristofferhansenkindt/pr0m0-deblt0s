import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_H5ztya4WPQTY@ep-cool-tree-acu3e9gi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(DATABASE_URL)

export async function POST(request: NextRequest) {
  console.log("🔔 [WEBHOOK] ===== RECEBENDO POSTBACK DA EXPFYPAY =====")
  console.log("🔔 [WEBHOOK] Timestamp:", new Date().toISOString())
  console.log("🔔 [WEBHOOK] URL:", request.url)
  console.log("🔔 [WEBHOOK] Method:", request.method)

  try {
    // Captura todos os headers
    const headers = Object.fromEntries(request.headers.entries())
    console.log("📋 [WEBHOOK] Headers recebidos:")
    console.log(JSON.stringify(headers, null, 2))

    // Captura o body
    const body = await request.json()
    console.log("📦 [WEBHOOK] Body recebido:")
    console.log(JSON.stringify(body, null, 2))

    // Captura informações da requisição
    const clientIp = request.ip || headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown"
    const userAgent = headers["user-agent"] || "unknown"

    console.log("🌐 [WEBHOOK] Client IP:", clientIp)
    console.log("🖥️ [WEBHOOK] User Agent:", userAgent)

    const isExpfyPay =
      userAgent.toLowerCase().includes("expfypay") ||
      headers["x-expfypay-signature"] ||
      body.gateway === "expfypay" ||
      body.provider === "expfypay"

    console.log("🏢 [WEBHOOK] É da ExpfyPay?", isExpfyPay)

    // Log específico dos dados importantes
    if (body.id || body.transaction_id) {
      console.log("🆔 [WEBHOOK] Transaction ID:", body.id || body.transaction_id)
    }
    if (body.status) {
      console.log("📊 [WEBHOOK] Status:", body.status)
    }
    if (body.amount) {
      console.log("💰 [WEBHOOK] Amount:", body.amount)
    }
    if (body.event || body.event_type) {
      console.log("🎯 [WEBHOOK] Event:", body.event || body.event_type)
    }
    if (body.customer) {
      console.log("👤 [WEBHOOK] Customer:", JSON.stringify(body.customer, null, 2))
    }
    if (body.payment_method) {
      console.log("💳 [WEBHOOK] Payment Method:", body.payment_method)
    }

    // Salva o webhook no banco de dados
    console.log("💾 [WEBHOOK] Salvando no banco de dados...")

    const insertResult = await sql`
      INSERT INTO webhooks (
        transaction_id,
        status,
        event_type,
        headers,
        body,
        client_ip,
        user_agent,
        processed
      ) VALUES (
        ${body.id || body.transaction_id || null},
        ${body.status || null},
        ${body.event || body.event_type || "payment_update"},
        ${JSON.stringify(headers)},
        ${JSON.stringify(body)},
        ${clientIp},
        ${userAgent},
        false
      )
      RETURNING id
    `

    console.log("✅ [WEBHOOK] Webhook salvo no banco com ID:", insertResult[0]?.id)

    if (body.status === "paid" || body.status === "approved" || body.status === "completed") {
      console.log("💰 [WEBHOOK] ===== PAGAMENTO CONFIRMADO =====")
      console.log("💰 [WEBHOOK] Transação paga:", body.id || body.transaction_id)
      console.log("💰 [WEBHOOK] Valor:", body.amount)

      // Aqui você pode adicionar lógica para:
      // - Atualizar status no banco
      // - Enviar email de confirmação
      // - Liberar acesso
      // - etc.
    } else if (body.status === "pending" || body.status === "waiting") {
      console.log("⏳ [WEBHOOK] Pagamento pendente:", body.id || body.transaction_id)
    } else if (body.status === "failed" || body.status === "cancelled" || body.status === "expired") {
      console.log("❌ [WEBHOOK] Pagamento falhou/cancelado:", body.id || body.transaction_id)
      console.log("❌ [WEBHOOK] Motivo:", body.failure_reason || body.reason || "Não informado")
    } else {
      console.log("❓ [WEBHOOK] Status desconhecido:", body.status)
    }

    // Log de resposta
    console.log("📤 [WEBHOOK] Enviando resposta de sucesso para ExpfyPay")

    // Responde com sucesso para a ExpfyPay
    return NextResponse.json({
      success: true,
      message: "Webhook recebido com sucesso",
      timestamp: new Date().toISOString(),
      processed: true,
    })
  } catch (error) {
    console.error("❌ [WEBHOOK] ===== ERRO AO PROCESSAR WEBHOOK =====")
    console.error("❌ [WEBHOOK] Erro:", error)
    console.error("❌ [WEBHOOK] Stack:", error.stack)

    // Mesmo com erro, tenta salvar o webhook para debug
    try {
      const errorBody = await request.text()
      console.log("🔍 [WEBHOOK] Body como texto (para debug):", errorBody)

      await sql`
        INSERT INTO webhooks (
          transaction_id,
          status,
          event_type,
          headers,
          body,
          client_ip,
          user_agent,
          processed,
          error_message
        ) VALUES (
          null,
          'error',
          'webhook_error',
          ${JSON.stringify(Object.fromEntries(request.headers.entries()))},
          ${errorBody},
          ${request.ip || "unknown"},
          ${request.headers.get("user-agent") || "unknown"},
          false,
          ${error.message}
        )
      `
      console.log("💾 [WEBHOOK] Erro salvo no banco para debug")
    } catch (saveError) {
      console.error("❌ [WEBHOOK] Erro ao salvar webhook com erro:", saveError)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Permite apenas POST
export async function GET() {
  console.log("⚠️ [WEBHOOK] Tentativa de GET no webhook - método não permitido")
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
