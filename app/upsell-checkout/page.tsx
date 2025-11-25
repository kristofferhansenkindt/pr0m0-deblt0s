"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function UpsellCheckoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      router.push("/confirmacao")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#071D41] mb-4">Processando sua assinatura...</h1>
        <p className="text-[#555555] mb-6">
          Estamos ativando seu Serviço de Monitoramento Premium. Você será redirecionado em instantes.
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1351B4]"></div>
        </div>
      </div>
    </div>
  )
}
