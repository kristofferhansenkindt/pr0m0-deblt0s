-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  data_nascimento VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  ip_address INET NOT NULL,
  user_agent TEXT,
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_step INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  placa VARCHAR(8) NOT NULL,
  modelo VARCHAR(255),
  marca VARCHAR(255),
  ano VARCHAR(20),
  cor VARCHAR(100),
  chassi VARCHAR(255),
  renavam VARCHAR(11),
  municipio VARCHAR(255),
  uf VARCHAR(2),
  situacao VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de eventos/tracking
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'form_submit', 'button_click', 'exit_intent'
  event_data JSONB,
  step INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de débitos consultados
CREATE TABLE IF NOT EXISTS debitos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  tipo VARCHAR(100),
  valor DECIMAL(10, 2),
  valor_total DECIMAL(10, 2),
  status VARCHAR(50),
  vencimento DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar os débitos gerados pelo sistema
CREATE TABLE IF NOT EXISTS debitos_gerados (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  placa VARCHAR(8) NOT NULL,
  
  -- Dados do débito
  tipo VARCHAR(100) NOT NULL,
  valor_original DECIMAL(10, 2) NOT NULL,
  juros DECIMAL(10, 2) DEFAULT 0,
  multa DECIMAL(10, 2) DEFAULT 0,
  valor_total DECIMAL(10, 2) NOT NULL,
  
  -- Dados específicos por tipo
  ano VARCHAR(4),
  data_infracao DATE,
  infracao TEXT,
  codigo_infracao VARCHAR(20),
  pontos INTEGER,
  auto_infracao VARCHAR(20),
  local_infracao TEXT,
  orgao VARCHAR(100),
  codigo_barras VARCHAR(50),
  referencia VARCHAR(255),
  
  -- Status e controle
  status VARCHAR(50) DEFAULT 'Pendente',
  vencimento DATE,
  
  -- Dados do desconto aplicado
  valor_com_desconto DECIMAL(10, 2) NOT NULL,
  percentual_desconto INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

-- Índices para débitos gerados
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_placa ON debitos_gerados(placa);
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_session ON debitos_gerados(session_id);
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_user ON debitos_gerados(user_id);
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_created ON debitos_gerados(created_at);
