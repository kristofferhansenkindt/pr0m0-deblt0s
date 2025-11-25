import { type NextRequest, NextResponse } from "next/server"
import { paymentStatusStore } from "../../webhook/allowpay/route"

const EXPFYPAY_PUBLIC_KEY = "pk_a73b3c27cd921c3e2cf81997b1b2a2e4319821ddf0c9a843"
const EXPFYPAY_SECRET_KEY = "sk_257b4e7adece557f4bcb7372026febbab3f4e1ae88003c8a0610441658465d64"
const EXPFYPAY_API_URL = "https://pro.expfypay.com/api/v1/pix"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID é obrigatório" }, { status: 400 })
    }

    const status = paymentStatusStore.get(transactionId) || "pending"

    console.log(`🔍 [CHECK STATUS] Transaction ${transactionId}: ${status}`)

    return NextResponse.json({
      success: true,
      transactionId,
      status,
      isPaid: status === "paid",
    })
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor ao verificar pagamento",
      },
      { status: 500 },
    )
  }
}
