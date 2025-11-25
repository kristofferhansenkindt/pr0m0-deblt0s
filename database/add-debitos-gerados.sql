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
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_placa ON debitos_gerados(placa);
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_session ON debitos_gerados(session_id);
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_user ON debitos_gerados(user_id);
CREATE INDEX IF NOT EXISTS idx_debitos_gerados_created ON debitos_gerados(created_at);
