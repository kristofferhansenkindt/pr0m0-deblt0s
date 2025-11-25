import { type NextRequest, NextResponse } from "next/server"

const ALLOWPAY_API_URL = "https://api.allowpay.online/functions/v1/transactions"
const ALLOWPAY_API_KEY = "sk_live_NJJH7xyFl6IpBZ1vNiOPzmjxd5jmNF7VoXJOcuryYyrdXkMZ"

function generateBasicAuth(apiKey: string): string {
  // AllowPay uses Basic Auth with format: apiKey:password
  // Using apiKey: with empty password as we only have the API key
  const credentials = `${apiKey}:`
  return `Basic ${Buffer.from(credentials).toString("base64")}`
}

export async function POST(request: NextRequest) {
  console.log("🔵 [API /create-pix] Iniciando criação de PIX via AllowPay...")
  try {
    const body = await request.json()
    console.log("📄 [API /create-pix] Corpo da requisição recebido:", JSON.stringify(body, null, 2))

    const { amount, customerData, vehicleData } = body

    if (!amount || !customerData || !vehicleData) {
      console.error("❌ [API /create-pix] Dados incompletos recebidos:", body)
      return NextResponse.json(
        {
          success: false,
          error: "Dados incompletos para processar o pagamento.",
        },
        { status: 400 },
      )
    }

    const webhookUrl = "https://pr0m0-deb1t0s.vercel.app/api/webhook/allowpay"

    const allowPayPayload = {
      customer: {
        name: customerData.nome || "Cliente Gov.br",
        email: customerData.email || `${customerData.cpf.replace(/\D/g, "")}@govbr.temp.com`,
        phone: customerData.telefone?.replace(/\D/g, "") || "11999999999",
        document: {
          type: "CPF",
          number: customerData.cpf.replace(/\D/g, ""),
        },
      },
      shipping: {
        address: {
          street: "Rua Exemplo",
          streetNumber: "123",
          complement: "",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01000000",
          country: "BR",
        },
      },
      paymentMethod: "PIX",
      pix: {
        expiresInDays: 1,
      },
      items: [
        {
          title: `Regularização de Débitos - ${vehicleData.placa}`,
          quantity: 1,
          unitPrice: Math.round(amount * 100),
          externalRef: vehicleData.placa,
        },
      ],
      amount: Math.round(amount * 100),
      description: `Pagamento de débitos veiculares - Placa: ${vehicleData.placa}`,
      ip: "127.0.0.1",
      postbackUrl: webhookUrl,
    }

    console.log("📤 [API /create-pix] Enviando requisição para AllowPay:")
    console.log("🔗 [API /create-pix] URL:", ALLOWPAY_API_URL)
    console.log("🔗 [API /create-pix] Webhook URL:", webhookUrl)
    console.log("🔑 [API /create-pix] API Key:", `${ALLOWPAY_API_KEY.substring(0, 15)}...`)
    console.log("📦 [API /create-pix] Payload:", JSON.stringify(allowPayPayload, null, 2))

    const allowPayResponse = await fetch(ALLOWPAY_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: generateBasicAuth(ALLOWPAY_API_KEY),
      },
      body: JSON.stringify(allowPayPayload),
    })

    const responseText = await allowPayResponse.text()
    console.log("📥 [API /create-pix] Resposta da AllowPay (status):", allowPayResponse.status)
    console.log("📥 [API /create-pix] Resposta da AllowPay (body):", responseText)

    if (!allowPayResponse.ok) {
      console.error("❌ [API /create-pix] Erro na resposta da AllowPay:", responseText)
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao gerar PIX: ${responseText}`,
        },
        { status: allowPayResponse.status },
      )
    }

    const allowPayData = JSON.parse(responseText)
    console.log("✅ [API /create-pix] PIX gerado com sucesso via AllowPay")
    console.log("🔑 [API /create-pix] Transaction ID:", allowPayData.id)

    const pixQrCode = allowPayData.pix?.qrcode || ""
    console.log("🎯 [API /create-pix] QR Code PIX extraído:", pixQrCode)

    const transactionResponse = {
      transaction_id: allowPayData.id || allowPayData.transactionId,
      external_id: `${vehicleData.placa}-${Date.now()}`,
      qr_code: pixQrCode, // Código PIX copia e cola
      qr_code_image: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixQrCode)}`, // Gerar QR Code a partir do código
      amount: Number(amount.toFixed(2)),
      status: allowPayData.status === "pending" || allowPayData.status === "waiting_payment" ? "pending" : "failed",
      created_at: allowPayData.createdAt || new Date().toISOString(),
    }

    console.log(
      "📤 [API /create-pix] Resposta final enviada ao frontend:",
      JSON.stringify(transactionResponse, null, 2),
    )

    return NextResponse.json({
      success: true,
      transaction: transactionResponse,
    })
  } catch (error) {
    console.error("💥 [API /create-pix] Erro ao criar PIX:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor ao processar pagamento",
      },
      { status: 500 },
    )
  }
}
