-- Adiciona colunas UTM na tabela sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_campaign ON sessions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_medium ON sessions(utm_medium);
