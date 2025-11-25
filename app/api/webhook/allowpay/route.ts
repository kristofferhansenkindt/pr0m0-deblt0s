import { type NextRequest, NextResponse } from "next/server"

// Store payment status in memory (for production, use a database like Supabase)
const paymentStatusStore = new Map<string, string>()

export async function POST(request: NextRequest) {
  console.log("🔔 [WEBHOOK] Recebendo notificação da AllowPay...")

  try {
    const body = await request.json()
    console.log("📦 [WEBHOOK] Payload completo:", JSON.stringify(body, null, 2))

    const { type, objectId, data } = body

    if (type === "transaction" && data) {
      const transactionId = data.id || objectId
      const status = data.status
      const paidAt = data.paidAt

      console.log(`💳 [WEBHOOK] Transaction ID: ${transactionId}`)
      console.log(`📊 [WEBHOOK] Status: ${status}`)
      console.log(`⏰ [WEBHOOK] Paid At: ${paidAt}`)

      // Store the payment status
      paymentStatusStore.set(transactionId, status)

      if (status === "paid") {
        console.log("✅ [WEBHOOK] Pagamento confirmado!")

        return NextResponse.json({
          success: true,
          message: "Webhook processado com sucesso - Pagamento confirmado",
          transactionId,
          status,
        })
      }

      console.log(`ℹ️ [WEBHOOK] Status atualizado para: ${status}`)
      return NextResponse.json({
        success: true,
        message: "Webhook processado com sucesso",
        transactionId,
        status,
      })
    }

    console.log("⚠️ [WEBHOOK] Tipo de evento não reconhecido")
    return NextResponse.json({
      success: true,
      message: "Evento recebido mas não processado",
    })
  } catch (error) {
    console.error("❌ [WEBHOOK] Erro ao processar webhook:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar webhook",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint ativo",
    timestamp: new Date().toISOString(),
  })
}

// Export the store for checking payment status
export { paymentStatusStore }
