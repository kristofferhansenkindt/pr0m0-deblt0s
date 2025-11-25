"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DebitosStepProps {
  userData: {
    nome: string
    cpf: string
    dataNascimento: string
    placa: string
    veiculo: {
      placa: string
      modelo: string
      marca: string
      ano: string
      cor: string
      chassi: string
      renavam: string
      municipio: string
      uf: string
      proprietario_desde: string
      situacao: string
    }
    debitos: Array<{
      tipo: string
      ano?: string
      data?: string
      local?: string
      valor: string
      status: string
      vencimento?: string
      juros?: string
      multa?: string
      total?: string
      orgao?: string
      codigo_barras?: string
      referencia?: string
      infracao?: string
      codigo?: string
      pontos?: string
      auto_infracao?: string
    }>
  }
  onVoltar: () => void
  onNovaConsulta: () => void
}

export function DebitosStep({ userData, onVoltar, onNovaConsulta }: DebitosStepProps) {
  const [pagamentoRealizado, setPagamentoRealizado] = useState(false)
  const [processandoPagamento, setProcessandoPagamento] = useState(false)
  const [codigoPagamento, setCodigoPagamento] = useState("")
  const [compartilhar, setCompartilhar] = useState(false)
  const [showDetalheDebito, setShowDetalheDebito] = useState<number | null>(null)
  const [metodoPagamento, setMetodoPagamento] = useState("pix")
  const [showQRCode, setShowQRCode] = useState(false)
  const [statusPagamento, setStatusPagamento] = useState<string | null>(null)
  const [pixData, setPixData] = useState<any>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Valores fixos da nova lógica
  const VALOR_FINAL_FIXO = 67.12

  // Calcula o valor total dos débitos
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

  // Valor com desconto sempre fixo
  const calcularTotalComDesconto = () => {
    return VALOR_FINAL_FIXO.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  // Calcula o percentual de desconto dinamicamente
  const calcularPercentualDesconto = () => {
    const totalNumerico = userData.debitos.reduce((total, debito) => {
      const valorString = debito.total || debito.valor
      const valor = Number.parseFloat(
        valorString
          .replace(/R\$\s?/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      )
      return total + (isNaN(valor) ? 0 : valor)
    }, 0)

    if (totalNumerico <= VALOR_FINAL_FIXO) return 0

    return Math.round(((totalNumerico - VALOR_FINAL_FIXO) / totalNumerico) * 100)
  }

  // Calcula a economia
  const calcularEconomia = () => {
    const totalNumerico = userData.debitos.reduce((total, debito) => {
      const valorString = debito.total || debito.valor
      const valor = Number.parseFloat(
        valorString
          .replace(/R\$\s?/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      )
      return total + (isNaN(valor) ? 0 : valor)
    }, 0)

    const economia = totalNumerico - VALOR_FINAL_FIXO
    return economia > 0 ? economia.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"
  }

  // Retorna o valor numérico final
  const getValorNumericoComDesconto = () => {
    return VALOR_FINAL_FIXO
  }

  // Funções para formatação
  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  // Formata o RENAVAM para exibição
  const formatRenavam = (renavam: string) => {
    return renavam.replace(/(\d{4})(\d{4})(\d{3})/, "$1.$2.$3")
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

  // Nova função para processar pagamento via SkalePay
  const processarPagamento = async () => {
    console.log("🔵 [DebitosStep] Iniciando processarPagamento...")
    try {
      setProcessandoPagamento(true)
      setStatusPagamento("Gerando PIX...")

      const valorFinal = getValorNumericoComDesconto()
      console.log(`💰 [DebitosStep] Valor final calculado: ${valorFinal}`)

      const payload = {
        amount: valorFinal,
        customerData: {
          nome: userData.nome,
          cpf: userData.cpf,
          email: `${userData.cpf.replace(/\D/g, "")}@temp.com`, // Usar um email real se disponível
          telefone: "11999999999", // Usar um telefone real se disponível
        },
        vehicleData: {
          placa: userData.veiculo.placa,
        },
      }
      console.log("📦 [DebitosStep] Payload para API /create-pix:", JSON.stringify(payload, null, 2))

      console.log("🚀 [DebitosStep] Enviando requisição para /api/payment/create-pix...")
      const response = await fetch("/api/payment/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log(`🚦 [DebitosStep] Resposta da API /create-pix - Status: ${response.status}`)
      const result = await response.json()
      console.log("📄 [DebitosStep] Resposta da API /create-pix (JSON):", result)

      if (result.success) {
        setPixData(result.transaction)
        setTransactionId(result.transaction.id)
        setShowQRCode(true)
        setStatusPagamento(null)
        console.log("✅ [DebitosStep] PIX gerado com sucesso:", result.transaction.id)
      } else {
        console.error("❌ [DebitosStep] Erro da API /create-pix:", result.error)
        throw new Error(result.error || "Erro ao gerar PIX")
      }
    } catch (error) {
      console.error("💥 [DebitosStep] Erro catastrófico ao processar pagamento:", error)
      setStatusPagamento(`Erro: ${error.message}. Tente novamente.`)
      setTimeout(() => {
        setStatusPagamento(null)
      }, 5000)
    } finally {
      setProcessandoPagamento(false)
      console.log("🏁 [DebitosStep] Finalizando processarPagamento.")
    }
  }

  const confirmarPagamentoPix = async () => {
    if (!transactionId) return

    setShowQRCode(false)
    setProcessandoPagamento(true)
    setStatusPagamento("Verificando pagamento PIX...")

    // Polling para verificar o status do pagamento
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-status?transactionId=${transactionId}`)
        const result = await response.json()

        if (result.success) {
          if (result.transaction.status === "paid") {
            // Pagamento confirmado
            const codigo = gerarCodigoPagamento()
            setCodigoPagamento(codigo)
            setPagamentoRealizado(true)
            setProcessandoPagamento(false)
            setStatusPagamento(null)
            return true
          } else if (result.transaction.status === "expired" || result.transaction.status === "cancelled") {
            // Pagamento expirado ou cancelado
            setStatusPagamento("PIX expirado ou cancelado")
            setProcessandoPagamento(false)
            setTimeout(() => {
              setStatusPagamento(null)
              setShowQRCode(false)
            }, 3000)
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
        setStatusPagamento("Tempo limite excedido. Verifique seu pagamento.")
        setProcessandoPagamento(false)
        setTimeout(() => {
          setStatusPagamento(null)
          setShowQRCode(false)
        }, 3000)
      }
    }

    // Inicia o polling após 5 segundos
    setTimeout(pollStatus, 5000)
  }

  const toggleCompartilhar = () => {
    setCompartilhar(!compartilhar)
  }

  const toggleDetalheDebito = (index: number) => {
    if (showDetalheDebito === index) {
      setShowDetalheDebito(null)
    } else {
      setShowDetalheDebito(index)
    }
  }

  // Variantes de animação
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const staggerItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemFade = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {processandoPagamento && statusPagamento && (
          <motion.div
            key="processando"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white p-6 rounded-sm border border-gray-200 mb-6"
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1351B4] mb-4"></div>
              <p className="text-lg font-medium text-[#071D41]">{statusPagamento}</p>
            </div>
          </motion.div>
        )}

        {pagamentoRealizado ? (
          <motion.div
            key="pagamento-realizado"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white p-6 rounded-sm border-2 border-[#06A73C] mb-6"
          >
            <motion.div
              className="flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <div className="bg-[#06A73C] rounded-full p-2">
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
            </motion.div>

            <motion.h2
              className="text-xl font-bold text-[#071D41] text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Pagamento Realizado com Sucesso!
            </motion.h2>

            <motion.div
              className="bg-[#F8F8F8] p-4 mb-4 border border-gray-200 rounded-sm"
              variants={staggerItems}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 gap-2">
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Código de Confirmação</p>
                  <p className="font-bold text-[#071D41] text-lg">{codigoPagamento}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Valor Pago</p>
                  <p className="font-medium text-[#071D41]">{calcularTotalComDesconto()}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Economia Obtida</p>
                  <p className="font-medium text-[#06A73C]">
                    {calcularEconomia()} ({calcularPercentualDesconto()}% de desconto)
                  </p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Data e Hora</p>
                  <p className="font-medium text-[#071D41]">{new Date().toLocaleString("pt-BR")}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Método de Pagamento</p>
                  <p className="font-medium text-[#071D41]">PIX</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">ID da Transação</p>
                  <p className="font-medium text-[#071D41]">{transactionId}</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#E6F2FF] p-4 mb-6 border-l-4 border-[#1351B4]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#1351B4]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[#071D41]">
                    <strong>Parabéns!</strong> Você economizou {calcularEconomia()} com o desconto de{" "}
                    {calcularPercentualDesconto()}%. O comprovante de pagamento foi enviado para o seu e-mail cadastrado
                    e também está disponível para download.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-4"
              variants={staggerItems}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                variants={itemFade}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="bg-white text-[#1351B4] border border-[#1351B4] py-3 px-6 rounded-sm hover:bg-[#F0F5FF] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
              >
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Imprimir Comprovante
              </motion.button>

              <motion.button
                variants={itemFade}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={toggleCompartilhar}
                className="bg-white text-[#1351B4] border border-[#1351B4] py-3 px-6 rounded-sm hover:bg-[#F0F5FF] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
              >
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Compartilhar
              </motion.button>

              <motion.button
                variants={itemFade}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onNovaConsulta}
                className="bg-[#1351B4] text-white py-3 px-6 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium"
              >
                Nova Consulta
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {compartilhar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-[#F0F5FF] rounded-sm overflow-hidden"
                >
                  <p className="text-sm font-medium text-[#071D41] mb-2">Compartilhar comprovante</p>
                  <div className="flex space-x-4">
                    <motion.button whileHover={{ scale: 1.1 }} className="text-[#1351B4]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} className="text-[#1351B4]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} className="text-[#1351B4]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="mt-6 p-4 bg-[#F8F8F8] border border-gray-200 rounded-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center">
                <div className="mr-3 text-[#06A73C]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#071D41]">Documento Oficial</h3>
                  <p className="text-xs text-[#555555]">
                    Este comprovante é um documento oficial e pode ser verificado através do código de autenticação no
                    portal do DETRAN.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : showQRCode && pixData ? (
          <motion.div
            key="qr-code"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm"
          >
            <motion.h2
              className="text-2xl font-bold text-[#071D41] text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Pagamento via PIX
            </motion.h2>

            <motion.div className="max-w-md mx-auto" variants={staggerItems} initial="hidden" animate="visible">
              {/* Desktop: Mostra QR Code */}
              <motion.div variants={itemFade} className="hidden md:block text-center mb-6">
                <div className="bg-white p-6 border-2 border-gray-200 rounded-lg mb-4 inline-block shadow-sm">
                  {pixData.pix?.qrCodeText ? (
                    <motion.div
                      className="w-64 h-64 flex items-center justify-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixData.pix.qrCodeText)}`}
                        alt="QR Code PIX"
                        className="w-64 h-64"
                        crossOrigin="anonymous"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-64 h-64 bg-[#F8F8F8] flex items-center justify-center rounded-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-32 w-32 text-[#1351B4]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-[#555555] mb-4">Abra o aplicativo do seu banco e escaneie o QR Code</p>
              </motion.div>

              {/* Mobile: Mostra Copia e Cola */}
              <motion.div variants={itemFade} className="block md:hidden mb-6">
                <div className="text-center mb-4">
                  <div className="bg-[#1351B4] text-white p-4 rounded-lg mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm font-medium">Pagamento via PIX no celular</p>
                  </div>
                  <p className="text-sm text-[#555555] mb-4">Copie o código abaixo e cole no seu aplicativo bancário</p>
                </div>

                {pixData.pix?.qrCodeText && (
                  <div className="bg-[#F8F8F8] p-4 border border-gray-200 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-[#071D41]">Código PIX</p>
                      <span className="text-xs text-[#555555]">Toque para copiar</span>
                    </div>
                    <button
                      type="button"
                      className="w-full bg-white border-2 border-dashed border-[#1351B4] p-4 rounded-lg hover:bg-[#F0F5FF] transition-colors text-left"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.pix.qrCodeText)
                        // Feedback visual
                        const button = event.target.closest("button")
                        const originalContent = button.innerHTML
                        button.innerHTML = `
                <div class="flex items-center justify-center text-[#06A73C]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="font-medium">Código copiado!</span>
                </div>
              `
                        setTimeout(() => {
                          button.innerHTML = originalContent
                        }, 2000)
                      }}
                    >
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#1351B4] mr-3 flex-shrink-0"
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
                        <span className="text-sm text-[#333333] font-mono break-all">
                          {pixData.pix.qrCodeText.substring(0, 50)}...
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Instruções */}
              <motion.div variants={itemFade} className="mb-6">
                <div className="bg-[#F0F5FF] p-4 rounded-lg border border-[#1351B4]">
                  <h3 className="text-lg font-bold text-[#071D41] mb-3 text-center">Como pagar</h3>

                  {/* Desktop Instructions */}
                  <div className="hidden md:block">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          1
                        </span>
                        <p className="text-sm text-[#333333]">Abra o aplicativo do seu banco</p>
                      </div>
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          2
                        </span>
                        <p className="text-sm text-[#333333]">Escolha a opção "PIX" ou "Pagar com QR Code"</p>
                      </div>
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          3
                        </span>
                        <p className="text-sm text-[#333333]">Escaneie o QR Code acima</p>
                      </div>
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          4
                        </span>
                        <p className="text-sm text-[#333333]">
                          Confirme o pagamento de <strong>{calcularTotalComDesconto()}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Instructions */}
                  <div className="block md:hidden">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          1
                        </span>
                        <p className="text-sm text-[#333333]">Copie o código PIX tocando no botão acima</p>
                      </div>
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          2
                        </span>
                        <p className="text-sm text-[#333333]">Abra o aplicativo do seu banco</p>
                      </div>
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          3
                        </span>
                        <p className="text-sm text-[#333333]">Escolha "PIX" → "Copia e Cola"</p>
                      </div>
                      <div className="flex items-start">
                        <span className="bg-[#1351B4] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                          4
                        </span>
                        <p className="text-sm text-[#333333]">
                          Cole o código e confirme o pagamento de <strong>{calcularTotalComDesconto()}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Informações do Pagamento */}
              <motion.div variants={itemFade} className="bg-[#F8F8F8] p-4 border border-gray-200 rounded-lg mb-6">
                <h3 className="text-sm font-bold text-[#071D41] mb-3">Informações do Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#555555]">Valor a Pagar</p>
                    <p className="font-bold text-[#071D41] text-lg">{calcularTotalComDesconto()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555555]">Economia</p>
                    <p className="font-bold text-[#06A73C] text-lg">{calcularEconomia()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555555]">Beneficiário</p>
                    <p className="font-medium text-[#333333] text-sm">SECRETARIA DA FAZENDA {userData.veiculo.uf}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555555]">Validade</p>
                    <p className="font-medium text-[#333333] text-sm">30 minutos</p>
                  </div>
                </div>
              </motion.div>

              {/* Alerta importante */}
              <motion.div variants={itemFade} className="bg-[#FFF3CD] p-4 border border-[#FFCC29] rounded-lg mb-6">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#FF9100] mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-[#071D41]">
                      <strong>Importante:</strong> Após realizar o pagamento, clique em "Confirmar Pagamento". O sistema
                      verificará automaticamente se o pagamento foi processado.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Botões de ação */}
              <motion.div variants={itemFade} className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 bg-[#EDEDED] text-[#071D41] py-4 px-6 rounded-lg hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
                >
                  Voltar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={confirmarPagamentoPix}
                  disabled={processandoPagamento}
                  className="flex-1 bg-[#06A73C] text-white py-4 px-6 rounded-lg hover:bg-[#058F33] focus:outline-none focus:ring-2 focus:ring-[#06A73C] focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {processandoPagamento ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verificando...
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
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="bg-[#F8F8F8] p-4 mb-6 border border-gray-200 rounded-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-base font-bold text-[#071D41] mb-2">Dados do Veículo</h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={staggerItems}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Proprietário</p>
                  <p className="font-medium text-[#333333]">{userData.nome}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">CPF</p>
                  <p className="font-medium text-[#333333]">{formatCpf(userData.cpf)}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Data de Nascimento</p>
                  <p className="font-medium text-[#333333]">{userData.dataNascimento || "Não informado"}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Proprietário desde</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.proprietario_desde}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Placa</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.placa}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">RENAVAM</p>
                  <p className="font-medium text-[#333333]">{formatRenavam(userData.veiculo.renavam)}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Chassi</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.chassi}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Modelo</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.modelo}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Marca</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.marca}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Ano</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.ano}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Cor</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.cor}</p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Município/UF</p>
                  <p className="font-medium text-[#333333]">
                    {userData.veiculo.municipio}/{userData.veiculo.uf}
                  </p>
                </motion.div>
                <motion.div variants={itemFade}>
                  <p className="text-xs text-[#555555]">Situação</p>
                  <p className="font-medium text-[#333333]">{userData.veiculo.situacao}</p>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-[#071D41]">Débitos do Veículo</h2>
                <div className="text-xs text-[#555555]">
                  Atualizado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
                  {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {userData.debitos.length === 0 ? (
                <motion.div
                  className="bg-green-50 p-4 border border-green-200 rounded-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-green-800">Não há débitos pendentes para este veículo.</p>
                </motion.div>
              ) : (
                <motion.div
                  className="overflow-x-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
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
                          Valor Original
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                          Valor Total
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium text-[#071D41]">
                          Status
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-[#071D41]">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.debitos.map((debito, index) => (
                        <React.Fragment key={index}>
                          <motion.tr
                            className={index % 2 === 0 ? "bg-white" : "bg-[#F8F8F8]"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                          >
                            <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">{debito.tipo}</td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">
                              {debito.ano && `Ano: ${debito.ano}`}
                              {debito.data && `Data: ${debito.data}`}
                              {debito.referencia && (
                                <div className="text-xs text-[#555555]">Ref: {debito.referencia}</div>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">
                              {debito.vencimento || "-"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-[#333333]">{debito.valor}</td>
                            <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-[#333333]">
                              {debito.total || debito.valor}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-sm">
                                {debito.status}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                type="button"
                                onClick={() => toggleDetalheDebito(index)}
                                className="text-[#1351B4] hover:underline text-xs flex items-center justify-center mx-auto"
                              >
                                {showDetalheDebito === index ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 15l7-7 7 7"
                                      />
                                    </svg>
                                    Ocultar
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                    Detalhes
                                  </>
                                )}
                              </motion.button>
                            </td>
                          </motion.tr>
                          <AnimatePresence>
                            {showDetalheDebito === index && (
                              <motion.tr
                                className="bg-[#F0F5FF]"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <td colSpan={7} className="border border-gray-300 p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-xs text-[#555555]">Valor Principal</p>
                                      <p className="font-medium text-[#333333]">{debito.valor}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#555555]">Juros</p>
                                      <p className="font-medium text-[#333333]">{debito.juros || "R$ 0,00"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#555555]">Multa</p>
                                      <p className="font-medium text-[#333333]">{debito.multa || "R$ 0,00"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#555555]">Órgão Responsável</p>
                                      <p className="font-medium text-[#333333]">{debito.orgao || "Não informado"}</p>
                                    </div>
                                    {debito.codigo_barras && (
                                      <div className="col-span-2">
                                        <p className="text-xs text-[#555555]">Código de Barras</p>
                                        <p className="font-medium text-[#333333] break-all">{debito.codigo_barras}</p>
                                      </div>
                                    )}
                                    {debito.infracao && (
                                      <div className="col-span-3">
                                        <p className="text-xs text-[#555555]">Infração</p>
                                        <p className="font-medium text-[#333333]">{debito.infracao}</p>
                                      </div>
                                    )}
                                    {debito.codigo && (
                                      <div>
                                        <p className="text-xs text-[#555555]">Código da Infração</p>
                                        <p className="font-medium text-[#333333]">{debito.codigo}</p>
                                      </div>
                                    )}
                                    {debito.pontos && (
                                      <div>
                                        <p className="text-xs text-[#555555]">Pontos na CNH</p>
                                        <p className="font-medium text-[#333333]">{debito.pontos}</p>
                                      </div>
                                    )}
                                    {debito.auto_infracao && (
                                      <div>
                                        <p className="text-xs text-[#555555]">Auto de Infração</p>
                                        <p className="font-medium text-[#333333]">{debito.auto_infracao}</p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                      <motion.tr
                        className="bg-[#E6F2FF] font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right text-sm text-[#071D41]">
                          Total:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-[#071D41]">{calcularTotal()}</td>
                        <td colSpan={2} className="border border-gray-300 px-4 py-2"></td>
                      </motion.tr>
                    </tbody>
                  </table>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="bg-[#FFFAEA] p-4 mb-6 border-l-4 border-[#FFCC29] rounded-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#FF9100]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#071D41] mb-1">
                    PROGRAMA DE REGULARIZAÇÃO DE DÉBITOS VEICULARES - LEI Nº 14.999/2023
                  </h3>
                  <p className="text-sm text-[#333333]">
                    Por tempo limitado, você pode quitar todos os débitos deste veículo com{" "}
                    <span className="font-bold text-[#D4000F]">{calcularPercentualDesconto()}% de desconto</span>.
                    Aproveite esta oportunidade única e economize {calcularEconomia()}!
                  </p>
                  <motion.div
                    className="mt-3 bg-[#F8F8F8] p-3 border border-gray-200 rounded-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-[#555555]">Valor Original:</p>
                        <p className="text-sm font-medium text-[#333333] line-through">{calcularTotal()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#555555]">Você Economiza:</p>
                        <p className="text-lg font-bold text-[#06A73C]">{calcularEconomia()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#555555]">Valor Final:</p>
                        <p className="text-lg font-bold text-[#D4000F]">{calcularTotalComDesconto()}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <motion.div
                      className="mt-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <button
                        onClick={processarPagamento}
                        disabled={processandoPagamento}
                        className="w-full bg-[#06A73C] text-white py-3 px-6 rounded-sm hover:bg-[#058F33] focus:outline-none focus:ring-2 focus:ring-[#06A73C] focus:ring-offset-2 transition-colors font-bold flex items-center justify-center disabled:opacity-50"
                      >
                        {processandoPagamento ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Gerando PIX...
                          </>
                        ) : (
                          <>
                            💰 PAGAR AGORA COM {calcularPercentualDesconto()}% DE DESCONTO - ECONOMIZE{" "}
                            {calcularEconomia()}
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#E6F2FF] p-4 mb-6 border-l-4 border-[#1351B4]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#1351B4]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[#071D41]">
                    <strong>Desconto Especial:</strong> Este desconto de {calcularPercentualDesconto()}% é válido apenas
                    através desta plataforma oficial. Para pagamento regular sem desconto, dirija-se a uma agência
                    bancária autorizada.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onVoltar}
                className="bg-[#EDEDED] text-[#071D41] py-3 px-6 rounded-sm hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
              >
                Voltar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onNovaConsulta}
                className="bg-[#1351B4] text-white py-3 px-6 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium"
              >
                Nova Consulta
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
