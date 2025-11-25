import { neon } from "@neondatabase/serverless"

// Substituir a linha que usa process.env.DATABASE_URL por:
const DATABASE_URL =
  "postgresql://neondb_owner:npg_H5ztya4WPQTY@ep-cool-tree-acu3e9gi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(DATABASE_URL)

export interface User {
  id: number
  cpf: string
  nome: string
  data_nascimento?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: number
  session_id: string
  user_id?: number
  ip_address: string
  user_agent?: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  current_step: number
  completed: boolean
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: number
  user_id: number
  session_id: string
  placa: string
  modelo?: string
  marca?: string
  ano?: string
  cor?: string
  chassi?: string
  renavam?: string
  municipio?: string
  uf?: string
  situacao?: string
  created_at: string
}

export interface Event {
  id: number
  session_id: string
  event_type: string
  event_data?: any
  step?: number
  timestamp: string
}

export interface Debito {
  id: number
  user_id: number
  session_id: string
  tipo: string
  valor: number
  valor_total: number
  status: string
  vencimento?: string
  created_at: string
}

// Função para criar/atualizar usuário
export async function createOrUpdateUser(userData: {
  cpf: string
  nome: string
  data_nascimento?: string
}): Promise<User> {
  console.log("👤 Criando/atualizando usuário:", userData)

  try {
    const result = await sql`
      INSERT INTO users (cpf, nome, data_nascimento)
      VALUES (${userData.cpf}, ${userData.nome}, ${userData.data_nascimento})
      ON CONFLICT (cpf) 
      DO UPDATE SET 
        nome = EXCLUDED.nome,
        data_nascimento = EXCLUDED.data_nascimento,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    console.log("✅ Usuário criado/atualizado:", result[0])
    return result[0] as User
  } catch (error) {
    console.error("❌ Erro ao criar/atualizar usuário:", error)
    throw error
  }
}

// Função para criar sessão
export async function createSession(sessionData: {
  session_id: string
  user_id?: number
  ip_address: string
  user_agent?: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}): Promise<Session> {
  console.log("💾 Criando sessão:", sessionData)

  try {
    // Verifica se já existe a sessão antes de tentar criar
    const existingSession = await sql`
      SELECT * FROM sessions WHERE session_id = ${sessionData.session_id}
    `

    if (existingSession.length > 0) {
      console.log("🔄 Sessão já existe, atualizando se necessário")
      // Se já existe, apenas atualiza o user_id se fornecido
      if (sessionData.user_id) {
        const result = await sql`
          UPDATE sessions 
          SET user_id = ${sessionData.user_id}, updated_at = CURRENT_TIMESTAMP
          WHERE session_id = ${sessionData.session_id}
          RETURNING *
        `
        return result[0] as Session
      }
      return existingSession[0] as Session
    }

    // Se não existe, cria nova sessão
    const result = await sql`
      INSERT INTO sessions (
        session_id, user_id, ip_address, user_agent, 
        country, region, city, latitude, longitude,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term
      )
      VALUES (
        ${sessionData.session_id}, ${sessionData.user_id}, ${sessionData.ip_address},
        ${sessionData.user_agent}, ${sessionData.country}, ${sessionData.region},
        ${sessionData.city}, ${sessionData.latitude}, ${sessionData.longitude},
        ${sessionData.utm_source}, ${sessionData.utm_medium}, ${sessionData.utm_campaign},
        ${sessionData.utm_content}, ${sessionData.utm_term}
      )
      RETURNING *
    `
    console.log("✅ Sessão criada:", result[0])
    return result[0] as Session
  } catch (error) {
    console.error("❌ Erro ao criar sessão:", error)
    throw error
  }
}

// Função para atualizar step da sessão
export async function updateSessionStep(sessionId: string, step: number, completed = false): Promise<void> {
  console.log("📊 Atualizando step da sessão:", { sessionId, step, completed })

  try {
    await sql`
      UPDATE sessions 
      SET current_step = ${step}, completed = ${completed}, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
    `
    console.log("✅ Step da sessão atualizado")
  } catch (error) {
    console.error("❌ Erro ao atualizar step da sessão:", error)
    throw error
  }
}

// Função para registrar evento - VERSÃO CORRIGIDA
export async function trackEvent(eventData: {
  session_id: string
  event_type: string
  event_data?: any
  step?: number
}): Promise<void> {
  console.log("📝 Registrando evento:", eventData)

  try {
    // Primeiro verifica se a sessão existe
    const sessionExists = await sql`
      SELECT session_id FROM sessions WHERE session_id = ${eventData.session_id}
    `

    if (sessionExists.length === 0) {
      console.warn("⚠️ Sessão não encontrada, criando evento sem referência")
      // Não falha, apenas registra sem referência de sessão
    }

    // Converte event_data para JSON de forma segura
    let eventDataJson = null
    if (eventData.event_data) {
      try {
        eventDataJson = JSON.stringify(eventData.event_data)
      } catch (jsonError) {
        console.warn("⚠️ Erro ao converter event_data para JSON:", jsonError)
        eventDataJson = JSON.stringify({ error: "Invalid JSON data" })
      }
    }

    // Insere o evento
    await sql`
      INSERT INTO events (session_id, event_type, event_data, step)
      VALUES (${eventData.session_id}, ${eventData.event_type}, ${eventDataJson}::jsonb, ${eventData.step})
    `

    console.log("✅ Evento registrado com sucesso")
  } catch (error) {
    console.error("❌ Erro ao registrar evento:", error)
    // Log detalhado do erro
    console.error("❌ Detalhes do erro:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      eventData,
    })
    throw error
  }
}

// Função para salvar veículo
export async function saveVehicle(vehicleData: {
  user_id: number
  session_id: string
  placa: string
  modelo?: string
  marca?: string
  ano?: string
  cor?: string
  chassi?: string
  renavam?: string
  municipio?: string
  uf?: string
  situacao?: string
}): Promise<Vehicle> {
  console.log("🚗 Salvando veículo:", vehicleData)

  try {
    // Limita o RENAVAM a 11 caracteres e remove caracteres não numéricos
    const renavamLimpo = vehicleData.renavam ? vehicleData.renavam.replace(/\D/g, "").substring(0, 11) : null

    console.log("🔧 RENAVAM processado:", { original: vehicleData.renavam, limpo: renavamLimpo })

    const result = await sql`
      INSERT INTO vehicles (
        user_id, session_id, placa, modelo, marca, ano, cor, 
        chassi, renavam, municipio, uf, situacao
      )
      VALUES (
        ${vehicleData.user_id}, ${vehicleData.session_id}, ${vehicleData.placa},
        ${vehicleData.modelo}, ${vehicleData.marca}, ${vehicleData.ano}, ${vehicleData.cor},
        ${vehicleData.chassi}, ${renavamLimpo}, ${vehicleData.municipio}, 
        ${vehicleData.uf}, ${vehicleData.situacao}
      )
      RETURNING *
    `
    console.log("✅ Veículo salvo:", result[0])
    return result[0] as Vehicle
  } catch (error) {
    console.error("❌ Erro ao salvar veículo:", error)
    throw error
  }
}

// Função para salvar débitos
export async function saveDebitos(debitosData: {
  user_id: number
  session_id: string
  debitos: Array<{
    tipo: string
    valor: number
    valor_total: number
    status: string
    vencimento?: string
  }>
}): Promise<void> {
  console.log("💰 Salvando débitos:", debitosData)

  try {
    // Função para converter data de DD/MM/YYYY para YYYY-MM-DD
    const convertDateFormat = (dateStr?: string): string | null => {
      if (!dateStr) return null

      try {
        // Se já está no formato YYYY-MM-DD, retorna como está
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateStr
        }

        // Se está no formato DD/MM/YYYY, converte
        if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [dia, mes, ano] = dateStr.split("/")
          return `${ano}-${mes}-${dia}`
        }

        console.warn("⚠️ Formato de data não reconhecido:", dateStr)
        return null
      } catch (error) {
        console.warn("⚠️ Erro ao converter data:", dateStr, error)
        return null
      }
    }

    for (const debito of debitosData.debitos) {
      const vencimentoFormatado = convertDateFormat(debito.vencimento)

      console.log("📅 Salvando débito:", {
        tipo: debito.tipo,
        valor: debito.valor,
        valor_total: debito.valor_total,
        status: debito.status,
        vencimento: vencimentoFormatado,
      })

      await sql`
        INSERT INTO debitos (user_id, session_id, tipo, valor, valor_total, status, vencimento)
        VALUES (
          ${debitosData.user_id}, ${debitosData.session_id}, ${debito.tipo},
          ${debito.valor}, ${debito.valor_total}, ${debito.status}, ${vencimentoFormatado}
        )
      `
    }
    console.log("✅ Débitos salvos com sucesso")
  } catch (error) {
    console.error("❌ Erro ao salvar débitos:", error)
    throw error
  }
}

// Funções para o dashboard - SEM LIMITAÇÕES
export async function getDashboardStats() {
  console.log("📊 Buscando estatísticas do dashboard")

  try {
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users`
    const totalSessions = await sql`SELECT COUNT(*) as count FROM sessions`
    const completedSessions = await sql`SELECT COUNT(*) as count FROM sessions WHERE completed = true`
    const todaySessions = await sql`
      SELECT COUNT(*) as count FROM sessions 
      WHERE DATE(created_at) = CURRENT_DATE
    `
    const totalVehicles = await sql`SELECT COUNT(*) as count FROM vehicles`
    const totalDebitos = await sql`SELECT COUNT(*) as count FROM debitos`

    const conversionRate =
      totalSessions[0].count > 0 ? ((completedSessions[0].count / totalSessions[0].count) * 100).toFixed(2) : "0.00"

    const stats = {
      totalUsers: Number.parseInt(totalUsers[0].count),
      totalSessions: Number.parseInt(totalSessions[0].count),
      completedSessions: Number.parseInt(completedSessions[0].count),
      todaySessions: Number.parseInt(todaySessions[0].count),
      totalVehicles: Number.parseInt(totalVehicles[0].count),
      totalDebitos: Number.parseInt(totalDebitos[0].count),
      conversionRate: Number.parseFloat(conversionRate),
    }

    console.log("✅ Estatísticas obtidas:", stats)
    return stats
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error)
    throw error
  }
}

// BUSCAR TODOS OS DADOS SEM LIMITAÇÕES
export async function getRecentSessions(limit = 1000): Promise<any[]> {
  console.log("📋 Buscando TODAS as sessões, limit:", limit)

  try {
    const result = await sql`
      SELECT 
        s.*,
        u.nome,
        u.cpf,
        u.data_nascimento,
        v.placa,
        v.modelo,
        v.marca,
        v.ano,
        v.cor,
        v.chassi,
        v.renavam,
        v.municipio,
        v.uf,
        v.situacao
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN vehicles v ON s.session_id = v.session_id
      ORDER BY s.created_at DESC
      LIMIT ${limit}
    `
    console.log("✅ Sessões obtidas:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar sessões:", error)
    throw error
  }
}

export async function getAllUsers(): Promise<any[]> {
  console.log("👥 Buscando TODOS os usuários")

  try {
    const result = await sql`
      SELECT 
        u.*,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT v.id) as total_vehicles,
        COUNT(DISTINCT d.id) as total_debitos,
        MAX(s.created_at) as last_access
      FROM users u
      LEFT JOIN sessions s ON u.id = s.user_id
      LEFT JOIN vehicles v ON u.id = v.user_id
      LEFT JOIN debitos d ON u.id = d.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `
    console.log("✅ Usuários obtidos:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar usuários:", error)
    throw error
  }
}

export async function getAllVehicles(): Promise<any[]> {
  console.log("🚗 Buscando TODOS os veículos")

  try {
    const result = await sql`
      SELECT 
        v.*,
        u.nome as proprietario_nome,
        u.cpf as proprietario_cpf,
        COUNT(DISTINCT d.id) as total_debitos,
        SUM(d.valor_total) as valor_total_debitos
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN debitos d ON v.user_id = d.user_id
      GROUP BY v.id, u.nome, u.cpf
      ORDER BY v.created_at DESC
    `
    console.log("✅ Veículos obtidos:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar veículos:", error)
    throw error
  }
}

export async function getAllDebitos(): Promise<any[]> {
  console.log("💰 Buscando TODOS os débitos")

  try {
    const result = await sql`
      SELECT 
        d.*,
        u.nome as usuario_nome,
        u.cpf as usuario_cpf,
        v.placa,
        v.modelo,
        v.marca
      FROM debitos d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.session_id = v.session_id
      ORDER BY d.created_at DESC
    `
    console.log("✅ Débitos obtidos:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar débitos:", error)
    throw error
  }
}

export async function getSessionsByCountry() {
  console.log("🌍 Buscando sessões por país")

  try {
    const result = await sql`
      SELECT country, COUNT(*) as count
      FROM sessions
      WHERE country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
    `
    console.log("✅ Sessões por país obtidas:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar sessões por país:", error)
    throw error
  }
}

export async function getSessionsByStep() {
  console.log("📊 Buscando sessões por step")

  try {
    const result = await sql`
      SELECT current_step, COUNT(*) as count
      FROM sessions
      GROUP BY current_step
      ORDER BY current_step
    `
    console.log("✅ Sessões por step obtidas:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar sessões por step:", error)
    throw error
  }
}

export async function getSessionsOverTime() {
  console.log("📈 Buscando sessões ao longo do tempo")

  try {
    const result = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sessions,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
      FROM sessions
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `
    console.log("✅ Sessões ao longo do tempo obtidas:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar sessões ao longo do tempo:", error)
    throw error
  }
}

// Funções para análise de campanhas UTM
export async function getCampaignStats() {
  console.log("📊 Buscando estatísticas de campanhas")

  try {
    // Estatísticas gerais por UTM Source
    const campaignsBySource = await sql`
      SELECT 
        utm_source,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN completed = true THEN 1 END) as conversions,
        ROUND(
          (COUNT(CASE WHEN completed = true THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as conversion_rate
      FROM sessions 
      WHERE utm_source IS NOT NULL
      GROUP BY utm_source
      ORDER BY total_sessions DESC
    `

    // Estatísticas por campanha específica
    const campaignsByName = await sql`
      SELECT 
        utm_campaign,
        utm_source,
        utm_medium,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN completed = true THEN 1 END) as conversions,
        ROUND(
          (COUNT(CASE WHEN completed = true THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as conversion_rate,
        COUNT(CASE WHEN current_step >= 2 THEN 1 END) as reached_step_2,
        COUNT(CASE WHEN current_step >= 3 THEN 1 END) as reached_step_3
      FROM sessions 
      WHERE utm_campaign IS NOT NULL
      GROUP BY utm_campaign, utm_source, utm_medium
      ORDER BY total_sessions DESC
    `

    // Performance por conteúdo/anúncio
    const campaignsByContent = await sql`
      SELECT 
        utm_content,
        utm_campaign,
        utm_source,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN completed = true THEN 1 END) as conversions,
        ROUND(
          (COUNT(CASE WHEN completed = true THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as conversion_rate
      FROM sessions 
      WHERE utm_content IS NOT NULL
      GROUP BY utm_content, utm_campaign, utm_source
      ORDER BY total_sessions DESC
    `

    // Funil de conversão por fonte
    const funnelBySource = await sql`
      SELECT 
        utm_source,
        COUNT(*) as total_visitors,
        COUNT(CASE WHEN current_step >= 1 THEN 1 END) as step_1_login,
        COUNT(CASE WHEN current_step >= 2 THEN 1 END) as step_2_placa,
        COUNT(CASE WHEN current_step >= 3 THEN 1 END) as step_3_debitos,
        COUNT(CASE WHEN completed = true THEN 1 END) as step_4_completed
      FROM sessions 
      WHERE utm_source IS NOT NULL
      GROUP BY utm_source
      ORDER BY total_visitors DESC
    `

    // Campanhas ao longo do tempo (últimos 30 dias)
    const campaignsOverTime = await sql`
      SELECT 
        DATE(created_at) as date,
        utm_source,
        COUNT(*) as sessions,
        COUNT(CASE WHEN completed = true THEN 1 END) as conversions
      FROM sessions
      WHERE utm_source IS NOT NULL 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at), utm_source
      ORDER BY date DESC, sessions DESC
    `

    console.log("✅ Estatísticas de campanhas obtidas")
    return {
      campaignsBySource,
      campaignsByName,
      campaignsByContent,
      funnelBySource,
      campaignsOverTime,
    }
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas de campanhas:", error)
    throw error
  }
}

export async function getTopPerformingCampaigns(limit = 100) {
  console.log("🏆 Buscando campanhas com melhor performance")

  try {
    const result = await sql`
      SELECT 
        utm_campaign,
        utm_source,
        utm_medium,
        utm_content,
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN completed = true THEN 1 END) as conversions,
        ROUND(
          (COUNT(CASE WHEN completed = true THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as conversion_rate,
        MAX(created_at) as last_session
      FROM sessions 
      WHERE utm_campaign IS NOT NULL
      GROUP BY utm_campaign, utm_source, utm_medium, utm_content
      HAVING COUNT(*) >= 1  -- Mostra todas as campanhas
      ORDER BY conversion_rate DESC, total_sessions DESC
      LIMIT ${limit}
    `

    console.log("✅ Top campanhas obtidas:", result.length)
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar top campanhas:", error)
    throw error
  }
}
