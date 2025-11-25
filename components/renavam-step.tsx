"use client"

import type React from "react"

import { useState } from "react"
import { renavamMask } from "@/utils/validators"

interface RenavamStepProps {
  nome: string
  cpf: string
  onSubmit: (renavam: string) => void
  onVoltar: () => void
}

export function RenavamStep({ nome, cpf, onSubmit, onVoltar }: RenavamStepProps) {
  const [renavam, setRenavam] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Remove máscara para validação
    const renavamClean = renavam.replace(/\D/g, "")

    if (!renavamClean) {
      setError("RENAVAM é obrigatório")
      return
    }

    // Simulação de carregamento
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError("")
      onSubmit(renavamClean)
    }, 1500)
  }

  const handleRenavamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRenavam(renavamMask(value))
    if (error) setError("")
  }

  // Formata o CPF para exibição
  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <div>
      <div className="bg-[#F8F8F8] p-4 mb-6 border border-gray-200 rounded-sm">
        <h2 className="text-base font-bold text-[#071D41] mb-2">Proprietário Identificado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#555555]">Nome</p>
            <p className="font-medium text-[#333333]">{nome}</p>
          </div>
          <div>
            <p className="text-xs text-[#555555]">CPF</p>
            <p className="font-medium text-[#333333]">{formatCpf(cpf)}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#E6F2FF] p-4 mb-6 border-l-4 border-[#1351B4]">
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
              Informe o RENAVAM do veículo para consultar os débitos. O RENAVAM possui 11 dígitos e pode ser encontrado
              no Certificado de Registro e Licenciamento de Veículo (CRLV).
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-6">
          <label htmlFor="renavam" className="block mb-2 text-sm font-medium text-[#333333]">
            RENAVAM do Veículo
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
              id="renavam"
              value={renavam}
              onChange={handleRenavamChange}
              placeholder="00000000000"
              className={`w-full pl-10 p-3 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4] text-[#333333]`}
              disabled={loading}
            />
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-xs text-[#555555]">
            Digite apenas os números do RENAVAM. A formatação será aplicada automaticamente.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onVoltar}
            className="bg-[#EDEDED] text-[#071D41] py-3 px-6 rounded-sm hover:bg-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
            disabled={loading}
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#1351B4] text-white py-3 px-6 rounded-sm hover:bg-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:ring-offset-2 transition-colors font-medium flex items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Consultando...
              </>
            ) : (
              "Consultar"
            )}
          </button>
        </div>
      </form>

      {/* Dicas e informações */}
      <div className="mt-8 bg-[#F8F8F8] p-4 rounded-sm border border-gray-200">
        <h3 className="text-sm font-bold text-[#071D41] mb-3">Onde encontrar o RENAVAM?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex">
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
              <p className="text-xs text-[#555555]">Campo "RENAVAM" no documento</p>
            </div>
          </div>

          <div className="flex">
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
              <p className="text-xs text-[#555555]">Campo "RENAVAM" no documento</p>
            </div>
          </div>

          <div className="flex">
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
              <p className="text-sm font-medium text-[#333333]">Boleto de IPVA</p>
              <p className="text-xs text-[#555555]">Informado no boleto de pagamento</p>
            </div>
          </div>

          <div className="flex">
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
          </div>
        </div>
      </div>
    </div>
  )
}
