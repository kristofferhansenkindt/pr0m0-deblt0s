"use client"

import { LoginPage } from "@/components/login-page"
import { useTracking } from "@/hooks/use-tracking"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { sessionId, isInitialized, trackingEnabled, trackEvent, trackUser } = useTracking()
  const router = useRouter()

  // Tracking de page view quando o tracking estiver pronto
  useEffect(() => {
    if (isInitialized && trackingEnabled && sessionId) {
      trackEvent("page_view", { step: 1, page: "login" }, 1)
    }
  }, [isInitialized, trackingEnabled, sessionId, trackEvent])

  const handleCpfSubmit = async (cpf: string, nome: string, dataNascimento: string) => {
    let userId = null

    // Tracking do usuário se habilitado
    if (trackingEnabled && sessionId) {
      try {
        console.log("👤 Fazendo tracking do usuário:", { cpf, nome, dataNascimento })
        const user = await trackUser({ cpf, nome, data_nascimento: dataNascimento })
        if (user) {
          userId = user.id
          console.log("✅ Usuário tracked com ID:", userId)
        }

        await trackEvent("login_success", { cpf, nome }, 2)
      } catch (error) {
        console.warn("⚠️ User tracking falhou:", error)
      }
    }

    // Salva os dados no localStorage incluindo o ID do usuário
    const userData = {
      id: userId, // Added user ID from database
      cpf,
      nome,
      dataNascimento,
      timestamp: Date.now(),
    }

    localStorage.setItem("userData", JSON.stringify(userData))

    // Redireciona instantaneamente
    router.push("/veiculo")
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <LoginPage onSubmit={handleCpfSubmit} />
    </main>
  )
}
