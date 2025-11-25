import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_H5ztya4WPQTY@ep-cool-tree-acu3e9gi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(DATABASE_URL)

// Função para registrar visita de página
export async function trackPageVisit(sessionId: string, pageSlug: string, pageTitle: string) {
  console.log("📄 Registrando visita de página:", { sessionId, pageSlug, pageTitle })

  try {
    await sql`
      INSERT INTO page_visits (session_id, page_slug, page_title)
      VALUES (${sessionId}, ${pageSlug}, ${pageTitle})
    `

    // Atualizar contadores na sessão
    await sql`
      UPDATE sessions 
      SET pages_visited = pages_visited + 1, 
          last_page_slug = ${pageSlug},
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
    `

    console.log("✅ Visita de página registrada")
  } catch (error) {
    console.error("❌ Erro ao registrar visita de página:", error)
    throw error
  }
}

// Função para registrar ação do usuário
export async function trackUserAction(sessionId: string, actionType: string, elementId: string, actionData: any = {}) {
  console.log("🎯 Registrando ação do usuário:", { sessionId, actionType, elementId })

  try {
    await sql`
      INSERT INTO user_actions (session_id, action_type, element_id, action_data)
      VALUES (${sessionId}, ${actionType}, ${elementId}, ${JSON.stringify(actionData)}::jsonb)
    `

    console.log("✅ Ação do usuário registrada")
  } catch (error) {
    console.error("❌ Erro ao registrar ação do usuário:", error)
    throw error
  }
}

// Função para atualizar tempo gasto na página
export async function updatePageTime(sessionId: string, pageSlug: string, timeSpent: number) {
  try {
    await sql`
      UPDATE page_visits 
      SET time_spent = ${timeSpent}, exit_time = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId} AND page_slug = ${pageSlug}
      AND exit_time IS NULL
    `

    // Atualizar tempo total na sessão
    await sql`
      UPDATE sessions 
      SET time_on_site = time_on_site + ${timeSpent}
      WHERE session_id = ${sessionId}
    `
  } catch (error) {
    console.error("❌ Erro ao atualizar tempo na página:", error)
  }
}

// Função para registrar dados geográficos
export async function saveGeographicData(sessionId: string, geoData: any) {
  try {
    await sql`
      INSERT INTO geographic_data (
        session_id, country, region, city, state_code, state_name,
        latitude, longitude, timezone, isp
      )
      VALUES (
        ${sessionId}, ${geoData.country}, ${geoData.region}, ${geoData.city},
        ${geoData.state_code}, ${geoData.state_name}, ${geoData.latitude},
        ${geoData.longitude}, ${geoData.timezone}, ${geoData.isp}
      )
    `
  } catch (error) {
    console.error("❌ Erro ao salvar dados geográficos:", error)
  }
}

// Função para obter detalhes completos de uma sessão
export async function getSessionDetails(sessionId: string) {
  console.log("🔍 Buscando detalhes da sessão:", sessionId)

  try {
    // Dados básicos da sessão
    const sessionData = await sql`
      SELECT s.*, u.nome, u.cpf, u.data_nascimento,
             v.placa, v.modelo, v.marca, v.ano, v.cor,
             g.country, g.region, g.city, g.state_name
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN vehicles v ON s.session_id = v.session_id
      LEFT JOIN geographic_data g ON s.session_id = g.session_id
      WHERE s.session_id = ${sessionId}
    `

    // Visitas de página
    const pageVisits = await sql`
      SELECT * FROM page_visits 
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `

    // Ações do usuário
    const userActions = await sql`
      SELECT * FROM user_actions 
      WHERE session_id = ${sessionId}
      ORDER BY timestamp ASC
    `

    // Eventos de tracking
    const events = await sql`
      SELECT * FROM events 
      WHERE session_id = ${sessionId}
      ORDER BY timestamp ASC
    `

    // Dados de campanha
    const campaignData = await sql`
      SELECT * FROM campaign_analytics 
      WHERE session_id = ${sessionId}
    `

    return {
      session: sessionData[0] || null,
      pageVisits,
      userActions,
      events,
      campaignData: campaignData[0] || null,
    }
  } catch (error) {
    console.error("❌ Erro ao buscar detalhes da sessão:", error)
    throw error
  }
}

// Função para obter dados do mapa geográfico
export async function getGeographicMapData() {
  console.log("🗺️ Buscando dados do mapa geográfico")

  try {
    const stateData = await sql`
      SELECT 
        bs.state_code,
        bs.state_name,
        bs.region,
        bs.latitude,
        bs.longitude,
        COUNT(DISTINCT s.session_id) as session_count,
        COUNT(DISTINCT s.user_id) as user_count,
        COUNT(CASE WHEN s.completed = true THEN 1 END) as conversions
      FROM brazilian_states bs
      LEFT JOIN sessions s ON s.region = bs.state_name OR s.city LIKE '%' || bs.state_name || '%'
      GROUP BY bs.state_code, bs.state_name, bs.region, bs.latitude, bs.longitude
      ORDER BY session_count DESC
    `

    return stateData
  } catch (error) {
    console.error("❌ Erro ao buscar dados do mapa:", error)
    throw error
  }
}

// Função para análise detalhada de campanhas
export async function getEnhancedCampaignAnalytics() {
  console.log("📊 Buscando análise detalhada de campanhas")

  try {
    // Análise por fonte com funil detalhado
    const sourceAnalysis = await sql`
      SELECT 
        s.utm_source,
        COUNT(DISTINCT s.session_id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.current_step >= 1 THEN s.session_id END) as step_1_login,
        COUNT(DISTINCT CASE WHEN s.current_step >= 2 THEN s.session_id END) as step_2_placa,
        COUNT(DISTINCT CASE WHEN s.current_step >= 3 THEN s.session_id END) as step_3_debitos,
        COUNT(DISTINCT CASE WHEN s.completed = true THEN s.session_id END) as conversions,
        
        -- Métricas de engajamento
        AVG(s.time_on_site) as avg_time_on_site,
        AVG(s.pages_visited) as avg_pages_visited,
        
        -- Ações específicas
        COUNT(ua.id) FILTER (WHERE ua.action_type = 'button_click') as total_button_clicks,
        COUNT(ua.id) FILTER (WHERE ua.action_type = 'form_submit') as total_form_submissions,
        COUNT(ua.id) FILTER (WHERE ua.element_id LIKE '%checkout%') as checkout_clicks,
        COUNT(ua.id) FILTER (WHERE ua.element_id LIKE '%payment%') as payment_clicks,
        
        -- Taxa de conversão
        ROUND(
          (COUNT(CASE WHEN s.completed = true THEN 1 END)::decimal / COUNT(s.session_id)) * 100, 
          2
        ) as conversion_rate
      FROM sessions s
      LEFT JOIN user_actions ua ON s.session_id = ua.session_id
      WHERE s.utm_source IS NOT NULL
      GROUP BY s.utm_source
      ORDER BY total_sessions DESC
    `

    // Análise por campanha específica
    const campaignAnalysis = await sql`
      SELECT 
        s.utm_campaign,
        s.utm_source,
        s.utm_medium,
        s.utm_content,
        COUNT(DISTINCT s.session_id) as total_sessions,
        COUNT(DISTINCT s.user_id) as unique_users,
        
        -- Funil de conversão
        COUNT(CASE WHEN s.current_step >= 1 THEN 1 END) as reached_login,
        COUNT(CASE WHEN s.current_step >= 2 THEN 1 END) as reached_placa,
        COUNT(CASE WHEN s.current_step >= 3 THEN 1 END) as reached_debitos,
        COUNT(CASE WHEN s.completed = true THEN 1 END) as completed,
        
        -- Onde param no funil
        COUNT(CASE WHEN s.current_step = 1 AND s.completed = false THEN 1 END) as dropped_at_login,
        COUNT(CASE WHEN s.current_step = 2 AND s.completed = false THEN 1 END) as dropped_at_placa,
        COUNT(CASE WHEN s.current_step = 3 AND s.completed = false THEN 1 END) as dropped_at_debitos,
        
        -- Métricas de qualidade
        AVG(s.time_on_site) as avg_session_duration,
        AVG(s.pages_visited) as avg_pages_per_session,
        
        -- Ações por campanha
        COUNT(ua.id) FILTER (WHERE ua.action_type = 'button_click') as button_clicks,
        COUNT(ua.id) FILTER (WHERE ua.action_type = 'form_submit') as form_submissions,
        COUNT(ua.id) FILTER (WHERE ua.element_id LIKE '%checkout%' OR ua.element_text LIKE '%pagar%') as checkout_interactions,
        
        -- Dados temporais
        MIN(s.created_at) as first_session,
        MAX(s.created_at) as last_session,
        
        -- Taxa de conversão
        ROUND(
          (COUNT(CASE WHEN s.completed = true THEN 1 END)::decimal / COUNT(s.session_id)) * 100, 
          2
        ) as conversion_rate
      FROM sessions s
      LEFT JOIN user_actions ua ON s.session_id = ua.session_id
      WHERE s.utm_campaign IS NOT NULL
      GROUP BY s.utm_campaign, s.utm_source, s.utm_medium, s.utm_content
      HAVING COUNT(s.session_id) >= 1
      ORDER BY conversion_rate DESC, total_sessions DESC
    `

    // Análise de abandono por etapa
    const abandonmentAnalysis = await sql`
      SELECT 
        s.utm_source,
        s.utm_campaign,
        s.current_step,
        COUNT(*) as sessions_at_step,
        COUNT(CASE WHEN s.completed = false THEN 1 END) as abandoned_at_step,
        ROUND(
          (COUNT(CASE WHEN s.completed = false THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as abandonment_rate,
        
        -- Última página visitada antes do abandono
        s.last_page_slug as exit_page,
        AVG(s.time_on_site) as avg_time_before_exit
      FROM sessions s
      WHERE s.utm_source IS NOT NULL
      GROUP BY s.utm_source, s.utm_campaign, s.current_step, s.last_page_slug
      ORDER BY s.utm_source, s.current_step
    `

    // Análise de performance por conteúdo/anúncio
    const contentAnalysis = await sql`
      SELECT 
        s.utm_content,
        s.utm_campaign,
        s.utm_source,
        COUNT(DISTINCT s.session_id) as clicks,
        COUNT(DISTINCT s.user_id) as unique_visitors,
        COUNT(CASE WHEN s.completed = true THEN 1 END) as conversions,
        
        -- Métricas de engajamento específicas
        COUNT(ua.id) FILTER (WHERE ua.action_type = 'button_click' AND ua.element_text LIKE '%pagar%') as payment_button_clicks,
        COUNT(ua.id) FILTER (WHERE ua.action_type = 'button_click' AND ua.element_text LIKE '%consultar%') as search_button_clicks,
        
        ROUND(
          (COUNT(CASE WHEN s.completed = true THEN 1 END)::decimal / COUNT(s.session_id)) * 100, 
          2
        ) as conversion_rate,
        
        -- Custo por conversão (simulado)
        ROUND(COUNT(s.session_id) * 0.50, 2) as estimated_cost,
        CASE 
          WHEN COUNT(CASE WHEN s.completed = true THEN 1 END) > 0 
          THEN ROUND((COUNT(s.session_id) * 0.50) / COUNT(CASE WHEN s.completed = true THEN 1 END), 2)
          ELSE 0 
        END as cost_per_conversion
      FROM sessions s
      LEFT JOIN user_actions ua ON s.session_id = ua.session_id
      WHERE s.utm_content IS NOT NULL
      GROUP BY s.utm_content, s.utm_campaign, s.utm_source
      ORDER BY conversion_rate DESC, clicks DESC
    `

    return {
      sourceAnalysis,
      campaignAnalysis,
      abandonmentAnalysis,
      contentAnalysis,
    }
  } catch (error) {
    console.error("❌ Erro ao buscar análise de campanhas:", error)
    throw error
  }
}
