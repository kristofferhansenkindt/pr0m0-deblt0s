// Função para extrair parâmetros UTM da URL
export function extractUTMParams() {
  if (typeof window === "undefined") {
    console.log("❌ Window undefined - servidor")
    return {}
  }

  try {
    const url = new URL(window.location.href)
    console.log("🔍 URL completa:", window.location.href)
    console.log("🔍 Search params:", window.location.search)

    const utmParams = {
      utm_source: url.searchParams.get("utm_source") || undefined,
      utm_medium: url.searchParams.get("utm_medium") || undefined,
      utm_campaign: url.searchParams.get("utm_campaign") || undefined,
      utm_content: url.searchParams.get("utm_content") || undefined,
      utm_term: url.searchParams.get("utm_term") || undefined,
    }

    console.log("🎯 UTM params RAW:", utmParams)

    // Filtra parâmetros vazios
    const filteredParams = Object.fromEntries(Object.entries(utmParams).filter(([_, value]) => value !== undefined))

    console.log("🎯 UTM params FILTRADOS:", filteredParams)
    console.log("🎯 Quantidade de UTMs:", Object.keys(filteredParams).length)

    return filteredParams
  } catch (error) {
    console.error("❌ Erro ao extrair UTM params:", error)
    return {}
  }
}

// Função para salvar UTMs no localStorage
export function saveUTMsToStorage(utmParams: Record<string, string | undefined>) {
  if (typeof window === "undefined" || Object.keys(utmParams).length === 0) {
    return
  }

  try {
    // Só salva se tiver pelo menos um parâmetro UTM
    const hasUtm = Object.values(utmParams).some((value) => value !== undefined)
    if (hasUtm) {
      localStorage.setItem("utm_params", JSON.stringify(utmParams))
      console.log("💾 UTMs salvos no localStorage:", utmParams)
    }
  } catch (error) {
    console.error("❌ Erro ao salvar UTMs no localStorage:", error)
  }
}

// Função para recuperar UTMs do localStorage
export function getUTMsFromStorage(): Record<string, string | undefined> {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const storedUtms = localStorage.getItem("utm_params")
    if (storedUtms) {
      const utmParams = JSON.parse(storedUtms)
      console.log("🔍 UTMs recuperados do localStorage:", utmParams)
      return utmParams
    }
  } catch (error) {
    console.error("❌ Erro ao recuperar UTMs do localStorage:", error)
  }

  return {}
}
