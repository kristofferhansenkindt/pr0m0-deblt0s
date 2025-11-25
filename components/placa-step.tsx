"use client"

import type React from "react"

import { useState } from "react"
import { placaMask } from "@/utils/validators"
import { motion } from "framer-motion"

interface PlacaStepProps {
  nome: string
  cpf: string
  dataNascimento: string
  onSubmit: (placa: string) => void
  onVoltar: () => void
}

export function PlacaStep({ nome, cpf, dataNascimento, onSubmit, onVoltar }: PlacaStepProps) {
  const [placa, setPlaca] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [consultaStatus, setConsultaStatus] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Remove máscara para validação
    const placaClean = placa.replace(/[^a-zA-Z0-9]/g, "")

    if (!placaClean) {
      setError("Placa é obrigatória")
      return
    }

    // Validação básica de placa (formato antigo: ABC1234 ou novo: ABC1D23)
    const regexPlacaAntiga = /^[A-Za-z]{3}[0-9]{4}$/
    const regexPlacaNova = /^[A-Za-z]{3}[0-9]{1}[A-Za-z]{1}[0-9]{2}$/

    if (!regexPlacaAntiga.test(placaClean) && !regexPlacaNova.test(placaClean)) {
      setError("Formato de placa inválido")
      return
    }

    // Simulação de carregamento com etapas
    setLoading(true)
    setConsultaStatus("Validando placa...")

    // Simula um tempo para mostrar a mensagem de validação
    await new Promise((resolve) => setTimeout(resolve, 400))
    setConsultaStatus("Consultando base de dados...")

    // Simula um tempo para mostrar a mensagem de consulta
    await new Promise((resolve) => setTimeout(resolve, 500))
    setConsultaStatus("Verificando débitos...")

    // Simula um tempo para mostrar a mensagem de verificação
    await new Promise((resolve) => setTimeout(resolve, 500))
    setConsultaStatus("Preparando relatório...")

    // Chama a função de submissão após um tempo
    setTimeout(() => {
      setLoading(false)
      setError("")
      onSubmit(placaClean)
    }, 400)
  }

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlaca(placaMask(value))
    if (error) setError("")
  }

  // Formata o CPF para exibição
  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <div>
      <motion.div
        className="bg-[#F8F8F8] p-4 mb-6 border border-gray-200 rounded-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-base font-bold text-[#071D41] mb-2">Proprietário Identificado</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[#555555]">Nome</p>
            <p className="font-medium text-[#333333]">{nome}</p>
          </div>
          <div>
            <p className="text-xs text-[#555555]">CPF</p>
            <p className="font-medium text-[#333333]">{formatCpf(cpf)}</p>
          </div>
          <div>
            <p className="text-xs text-[#555555]">Data de Nascimento</p>
            <p className="font-medium text-[#333333]">{dataNascimento || "Não informado"}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-[#E6F2FF] p-4 mb-6 border-l-4 border-[#1351B4]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
              Informe a placa do veículo para consultar os débitos. A placa pode estar no formato antigo (ABC1234) ou no
              novo formato Mercosul (ABC1D23).
            </p>
          </div>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-6">
          <label htmlFor="placa" className="block mb-2 text-sm font-medium text-[#333333]">
            Placa do Veículo
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="placa"
              value={placa}
              onChange={handlePlacaChange}
              placeholder="ABC1234 ou ABC1D23"
              className={`w-full pl-10 p-3 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4] text-[#333333] uppercase`}
              disabled={loading}
              maxLength={8}
            />
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-xs text-[#555555]">
            Digite a placa do veículo sem traços ou espaços. A formatação será aplicada automaticamente.
          </p>
        </div>

        <div className="flex space-x-4">
          <motion.button
            type="button"
            onClick={onVoltar}
            className="bg-[#EDEDED] text-[#071D41] py-3 px-6 rounded-sm hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Voltar
          </motion.button>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#1351B4] text-white py-3 px-6 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium flex items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {consultaStatus || "Consultando..."}
                </div>
                {consultaStatus && (
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ) : (
              "Consultar"
            )}
          </button>
        </div>
      </motion.form>

      {/* Dicas e informações */}
      <motion.div
        className="mt-8 bg-[#F8F8F8] p-4 rounded-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-sm font-bold text-[#071D41] mb-3">Onde encontrar a placa do veículo?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="flex"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="mr-3 text-[#1351B4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#333333]">Parte frontal e traseira do veículo</p>
              <p className="text-xs text-[#555555]">Placas fixadas no veículo</p>
            </div>
          </motion.div>

          <motion.div
            className="flex"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="mr-3 text-[#1351B4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#333333]">Certificado de Registro (CRV)</p>
              <p className="text-xs text-[#555555]">Campo "Placa" no documento</p>
            </div>
          </motion.div>

          <motion.div
            className="flex"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <div className="mr-3 text-[#1351B4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#333333]">Licenciamento (CRLV)</p>
              <p className="text-xs text-[#555555]">Campo "Placa" no documento</p>
            </div>
          </motion.div>

          <motion.div
            className="flex"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="mr-3 text-[#1351B4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#333333]">Aplicativo DETRAN</p>
              <p className="text-xs text-[#555555]">Na seção "Meus Veículos"</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
