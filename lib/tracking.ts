import {
  createOrUpdateUser,
  saveVehicle,
  saveDebitos,
  trackEvent as dbTrackEvent,
  updateSessionStep,
} from "@/lib/database"

// Função para converter valor monetário brasileiro para número
function convertMonetaryValue(value: string | number): number {
  if (typeof value === "number") return value

  // Remove R$, espaços, pontos (milhares) e converte vírgula para ponto decimal
  const cleanValue = value
    .toString()
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()

  const numericValue = Number.parseFloat(cleanValue)
  return isNaN(numericValue) ? 0 : numericValue
}

// Função para fazer tracking de login de usuário
export async function trackUserLogin(
  sessionId: string,
  userData: { cpf: string; nome: string; data_nascimento?: string },
) {
  console.log("👤 Tracking de login de usuário:", { sessionId, userData })

  try {
    // Cria/atualiza o usuário
    const user = await createOrUpdateUser(userData)
    console.log("✅ Usuário criado/atualizado:", user)

    // Atualiza a sessão com o ID do usuário
    await updateSessionWithUser(sessionId, user.id)
    console.log("✅ Sessão atualizada com ID do usuário")

    // Registra evento de login
    await dbTrackEvent({
      session_id: sessionId,
      event_type: "user_login",
      event_data: { user_id: user.id, cpf: userData.cpf, nome: userData.nome },
      step: 1,
    })
    console.log("✅ Evento de login registrado")

    return user
  } catch (error) {
    console.error("❌ Erro no tracking de login:", error)
    throw error
  }
}

// Função para atualizar sessão com ID do usuário
async function updateSessionWithUser(sessionId: string, userId: number) {
  console.log("🔄 Atualizando sessão com ID do usuário:", { sessionId, userId })

  try {
    // Importa neon diretamente para atualizar a sessão
    const { neon } = await import("@neondatabase/serverless")
    const DATABASE_URL =
      "postgresql://neondb_owner:npg_H5ztya4WPQTY@ep-cool-tree-acu3e9gi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
    const sql = neon(DATABASE_URL)

    await sql`
      UPDATE sessions 
      SET user_id = ${userId}, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
    `
    console.log("✅ Sessão atualizada com sucesso")

    return true
  } catch (error) {
    console.error("❌ Erro ao atualizar sessão:", error)
    throw error
  }
}

// Função para fazer tracking de consulta de placa
export async function trackPlacaConsulta(sessionId: string, userId: number, vehicleData: any) {
  console.log("🚗 Tracking de consulta de placa:", { sessionId, userId, vehicleData })

  try {
    // Salva o veículo
    const vehicle = await saveVehicle({
      user_id: userId,
      session_id: sessionId,
      placa: vehicleData.placa,
      modelo: vehicleData.modelo,
      marca: vehicleData.marca,
      ano: vehicleData.ano,
      cor: vehicleData.cor,
      chassi: vehicleData.chassi,
      renavam: vehicleData.renavam,
      municipio: vehicleData.municipio,
      uf: vehicleData.uf,
      situacao: vehicleData.situacao,
    })
    console.log("✅ Veículo salvo:", vehicle)

    // Atualiza o step da sessão
    await updateSessionStep(sessionId, 2)
    console.log("✅ Step da sessão atualizado para 2")

    // Registra evento de consulta de placa
    await dbTrackEvent({
      session_id: sessionId,
      event_type: "vehicle_search",
      event_data: {
        vehicle_id: vehicle.id,
        placa: vehicleData.placa,
        modelo: vehicleData.modelo,
        marca: vehicleData.marca,
      },
      step: 2,
    })
    console.log("✅ Evento de consulta de placa registrado")

    return vehicle
  } catch (error) {
    console.error("❌ Erro no tracking de consulta de placa:", error)
    throw error
  }
}

// Função para fazer tracking de débitos
export async function trackDebitos(sessionId: string, userId: number, debitos: any[]) {
  console.log("💰 Tracking de débitos:", { sessionId, userId, debitos: debitos.length })

  try {
    // Converte os débitos para o formato correto
    const debitosFormatted = debitos.map((debito) => {
      console.log("🔄 Convertendo débito:", debito)

      const valorConvertido = convertMonetaryValue(debito.valor)
      const valorTotalConvertido = convertMonetaryValue(debito.total || debito.valor_total || debito.valor)

      console.log("💰 Valores convertidos:", {
        original: debito.valor,
        convertido: valorConvertido,
        totalOriginal: debito.total || debito.valor_total,
        totalConvertido: valorTotalConvertido,
      })

      return {
        tipo: debito.tipo || "Débito",
        valor: valorConvertido,
        valor_total: valorTotalConvertido,
        status: debito.status || "Pendente",
        vencimento: debito.vencimento,
      }
    })

    console.log("📊 Débitos formatados:", debitosFormatted)

    // Salva os débitos
    await saveDebitos({
      user_id: userId,
      session_id: sessionId,
      debitos: debitosFormatted,
    })
    console.log("✅ Débitos salvos")

    // Atualiza o step da sessão
    await updateSessionStep(sessionId, 3)
    console.log("✅ Step da sessão atualizado para 3")

    // Registra evento de consulta de débitos
    await dbTrackEvent({
      session_id: sessionId,
      event_type: "debits_search",
      event_data: {
        debits_count: debitos.length,
        total_value: debitosFormatted.reduce((sum, d) => sum + d.valor_total, 0),
      },
      step: 3,
    })
    console.log("✅ Evento de consulta de débitos registrado")

    return true
  } catch (error) {
    console.error("❌ Erro no tracking de débitos:", error)
    throw error
  }
}

// Função para fazer tracking de evento genérico
export async function trackEvent(sessionId: string, eventType: string, eventData?: any, step?: number) {
  console.log("📝 Tracking de evento:", { sessionId, eventType, step })

  try {
    // Registra o evento
    await dbTrackEvent({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      step,
    })
    console.log(`✅ Evento ${eventType} registrado`)

    // Se tem step, atualiza o step da sessão
    if (step) {
      await updateSessionStep(sessionId, step)
      console.log(`✅ Step da sessão atualizado para ${step}`)
    }

    return true
  } catch (error) {
    console.error(`❌ Erro no tracking de evento ${eventType}:`, error)
    throw error
  }
}

// Função para marcar sessão como completa
export async function completeSession(sessionId: string) {
  console.log("🏁 Marcando sessão como completa:", sessionId)

  try {
    // Atualiza o step da sessão e marca como completa
    await updateSessionStep(sessionId, 4, true)
    console.log("✅ Sessão marcada como completa")

    // Registra evento de conclusão
    await dbTrackEvent({
      session_id: sessionId,
      event_type: "session_completed",
      step: 4,
    })
    console.log("✅ Evento de conclusão registrado")

    return true
  } catch (error) {
    console.error("❌ Erro ao completar sessão:", error)
    throw error
  }
}
