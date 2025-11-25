-- Adicionar colunas para tracking detalhado nas sessões
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS time_on_site INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS pages_visited INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_page_slug VARCHAR(100);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS exit_page VARCHAR(100);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 0;

-- Tabela para rastrear visitas de página
CREATE TABLE IF NOT EXISTS page_visits (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  page_slug VARCHAR(100) NOT NULL,
  page_title VARCHAR(255),
  time_spent INTEGER DEFAULT 0,
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastrear ações específicas dos usuários
CREATE TABLE IF NOT EXISTS user_actions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  action_type VARCHAR(100) NOT NULL, -- 'button_click', 'form_submit', 'scroll', 'hover'
  element_id VARCHAR(255),
  element_text VARCHAR(500),
  page_slug VARCHAR(100),
  action_data JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para análise detalhada de campanhas
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  
  -- Métricas de engajamento
  pages_viewed INTEGER DEFAULT 0,
  time_on_site INTEGER DEFAULT 0,
  bounce_rate BOOLEAN DEFAULT FALSE,
  conversion_step INTEGER DEFAULT 0,
  
  -- Ações específicas
  form_submissions INTEGER DEFAULT 0,
  button_clicks INTEGER DEFAULT 0,
  checkout_attempts INTEGER DEFAULT 0,
  payment_attempts INTEGER DEFAULT 0,
  
  -- Dados de saída
  exit_intent BOOLEAN DEFAULT FALSE,
  exit_page VARCHAR(100),
  conversion_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para dados geográficos detalhados
CREATE TABLE IF NOT EXISTS geographic_data (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  state_code VARCHAR(2),
  state_name VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  isp VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estados brasileiros para o mapa
CREATE TABLE IF NOT EXISTS brazilian_states (
  id SERIAL PRIMARY KEY,
  state_code VARCHAR(2) UNIQUE NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Inserir dados dos estados brasileiros
INSERT INTO brazilian_states (state_code, state_name, region, latitude, longitude) VALUES
('AC', 'Acre', 'Norte', -9.0238, -70.8120),
('AL', 'Alagoas', 'Nordeste', -9.5713, -36.7820),
('AP', 'Amapá', 'Norte', 1.4144, -51.7865),
('AM', 'Amazonas', 'Norte', -4.9609, -61.9827),
('BA', 'Bahia', 'Nordeste', -13.2936, -41.4994),
('CE', 'Ceará', 'Nordeste', -5.4984, -39.3206),
('DF', 'Distrito Federal', 'Centro-Oeste', -15.7998, -47.8645),
('ES', 'Espírito Santo', 'Sudeste', -19.1834, -40.3089),
('GO', 'Goiás', 'Centro-Oeste', -15.827, -49.8362),
('MA', 'Maranhão', 'Nordeste', -4.9609, -45.2744),
('MT', 'Mato Grosso', 'Centro-Oeste', -12.6819, -56.9211),
('MS', 'Mato Grosso do Sul', 'Centro-Oeste', -20.7722, -54.7852),
('MG', 'Minas Gerais', 'Sudeste', -18.5122, -44.5550),
('PA', 'Pará', 'Norte', -3.9014, -52.4774),
('PB', 'Paraíba', 'Nordeste', -7.2399, -36.7819),
('PR', 'Paraná', 'Sul', -24.8932, -51.4934),
('PE', 'Pernambuco', 'Nordeste', -8.8137, -36.9541),
('PI', 'Piauí', 'Nordeste', -8.5692, -42.2373),
('RJ', 'Rio de Janeiro', 'Sudeste', -22.9099, -43.2095),
('RN', 'Rio Grande do Norte', 'Nordeste', -5.4026, -36.9541),
('RS', 'Rio Grande do Sul', 'Sul', -30.0346, -51.2177),
('RO', 'Rondônia', 'Norte', -10.9472, -63.0234),
('RR', 'Roraima', 'Norte', 2.7376, -62.0751),
('SC', 'Santa Catarina', 'Sul', -27.2423, -50.2189),
('SP', 'São Paulo', 'Sudeste', -23.5505, -46.6333),
('SE', 'Sergipe', 'Nordeste', -10.5741, -37.3857),
('TO', 'Tocantins', 'Norte', -10.1753, -48.2982)
ON CONFLICT (state_code) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_slug ON page_visits(page_slug);
CREATE INDEX IF NOT EXISTS idx_user_actions_session ON user_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_session ON campaign_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_source ON campaign_analytics(utm_source);
CREATE INDEX IF NOT EXISTS idx_geographic_data_session ON geographic_data(session_id);
CREATE INDEX IF NOT EXISTS idx_geographic_data_state ON geographic_data(state_code);
