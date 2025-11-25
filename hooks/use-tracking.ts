"use client"

import { useEffect, useState } from "react"
import { extractUTMParams, saveUTMsToStorage, getUTMsFromStorage } from "@/utils/utm-tracker"

export function useTracking() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [trackingEnabled, setTrackingEnabled] = useState(false)

  // Inicializa o tracking quando o componente monta
  useEffect(() => {
    const initTracking = async () => {
      try {
        console.log("🚀 Iniciando tracking...")
        console.log("🌐 URL atual:", window.location.href)
        console.log("🔍 Search params:", window.location.search)

        // Captura UTMs da URL atual
        const utmParams = extractUTMParams()
        console.log("📊 UTMs capturados:", utmParams)

        saveUTMsToStorage(utmParams)

        const storedUtms = getUTMsFromStorage()
        console.log("💾 UTMs do storage:", storedUtms)

        const finalUtms = { ...utmParams, ...storedUtms }
        console.log("🎯 UTMs finais para enviar:", finalUtms)

        const response = await fetch("/api/tracking/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            utmParams: finalUtms,
          }),
        })

        console.log("📡 Response status:", response.status)

        if (!response.ok) {
          console.warn("❌ Tracking init failed:", response.status, response.statusText)
          setIsInitialized(true)
          setTrackingEnabled(false)
          return
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("❌ Response não é JSON:", contentType)
          setIsInitialized(true)
          setTrackingEnabled(false)
          return
        }

        const data = await response.json()
        console.log("📊 Tracking data:", data)

        if (data.success && data.sessionId) {
          setSessionId(data.sessionId)
          setTrackingEnabled(true)
          localStorage.setItem("tracking_session_id", data.sessionId)
          console.log("✅ Tracking inicializado com sucesso:", data.sessionId)
        } else {
          console.warn("❌ Tracking unsuccessful:", data)
          setTrackingEnabled(false)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("❌ Erro ao inicializar tracking:", error)
        setIsInitialized(true)
        setTrackingEnabled(false)
      }
    }

    // Verifica se já existe uma sessão no localStorage
    const existingSessionId = localStorage.getItem("tracking_session_id")
    if (existingSessionId) {
      console.log("🔄 Usando sessão existente:", existingSessionId)
      setSessionId(existingSessionId)
      setTrackingEnabled(true)
      setIsInitialized(true)
    } else {
      initTracking()
    }
  }, [])

  // Função helper para fazer requests de tracking
  const makeTrackingRequest = async (url: string, data: any) => {
    if (!trackingEnabled || !sessionId) {
      console.warn("⚠️ Tracking desabilitado ou sem sessionId")
      return null
    }

    try {
      console.log(`📤 Enviando tracking para ${url}:`, data)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log(`📥 Response de ${url}:`, response.status)

      if (!response.ok) {
        console.warn(`❌ Tracking failed para ${url}:`, response.status)
        return null
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`❌ Response não é JSON para ${url}:`, contentType)
        return null
      }

      const result = await response.json()
      console.log(`✅ Tracking success para ${url}:`, result)
      return result
    } catch (error) {
      console.error(`❌ Erro no tracking ${url}:`, error)
      return null
    }
  }

  // Função para fazer tracking de usuário
  const trackUser = async (userData: { cpf: string; nome: string; data_nascimento?: string }) => {
    const result = await makeTrackingRequest("/api/tracking/user", {
      sessionId,
      userData,
    })
    return result?.success ? result.user : null
  }

  // Função para fazer tracking de veículo
  const trackVehicle = async (userId: number, vehicleData: any) => {
    const result = await makeTrackingRequest("/api/tracking/vehicle", {
      sessionId,
      userId,
      vehicleData,
    })
    return result?.success || false
  }

  // Função para fazer tracking de débitos
  const trackDebitos = async (userId: number, debitos: any[]) => {
    const result = await makeTrackingRequest("/api/tracking/debitos", {
      sessionId,
      userId,
      debitos,
    })
    return result?.success || false
  }

  // Função para fazer tracking de eventos genéricos
  const trackEvent = async (eventType: string, eventData?: any, step?: number) => {
    const result = await makeTrackingRequest("/api/tracking/event", {
      sessionId,
      eventType,
      eventData,
      step,
    })
    return result?.success || false
  }

  return {
    sessionId,
    isInitialized,
    trackingEnabled,
    trackUser,
    trackVehicle,
    trackDebitos,
    trackEvent,
  }
}
