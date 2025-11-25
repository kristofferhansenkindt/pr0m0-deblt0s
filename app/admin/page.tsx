"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

interface DashboardData {
  stats: {
    totalUsers: number
    totalSessions: number
    completedSessions: number
    todaySessions: number
    conversionRate: number
  }
  recentSessions: any[]
  sessionsByCountry: any[]
  sessionsByStep: any[]
  sessionsOverTime: any[]
  campaigns?: any // Adicionar esta linha
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleLogin = (password: string) => {
    if (password === "admin1234554321") {
      setIsAuthenticated(true)
      setLoginError("")
      loadDashboardData()
    } else {
      setLoginError("Senha incorreta. Tente novamente.")
    }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    setApiError(null)

    try {
      console.log("🔄 Carregando dados do dashboard...")

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: "Bearer admin1234554321",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro na API:", errorText)
        setApiError(`Erro ${response.status}: ${response.statusText}`)
        return
      }

      const data = await response.json()
      console.log("📊 Dados recebidos:", data)

      // Após a chamada para /api/admin/stats, adicionar:
      const campaignsResponse = await fetch("/api/admin/campaigns", {
        headers: {
          Authorization: "Bearer admin1234554321",
        },
      })

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json()
        if (campaignsData.success) {
          data.campaigns = campaignsData.data
        }
      }

      if (data.success && data.data) {
        setDashboardData(data.data)
        setLastUpdate(new Date())
        console.log("✅ Dados carregados com sucesso")
      } else {
        setApiError(data.error || "Erro desconhecido na API")
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error)
      setApiError(`Erro de rede: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setDashboardData(null)
    setLastUpdate(null)
    setApiError(null)
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadDashboardData()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />
  }

  return (
    <AdminDashboard
      dashboardData={dashboardData}
      loading={loading}
      apiError={apiError}
      lastUpdate={lastUpdate}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
    />
  )
}
