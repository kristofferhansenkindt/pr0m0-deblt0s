-- Criar tabela para armazenar webhooks recebidos
CREATE TABLE IF NOT EXISTS webhooks (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255),
  status VARCHAR(50),
  event_type VARCHAR(100) DEFAULT 'payment_update',
  headers JSONB,
  body JSONB,
  client_ip VARCHAR(45),
  user_agent TEXT,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhooks_transaction_id ON webhooks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON webhooks(created_at);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhooks(processed);

-- Comentários para documentação
COMMENT ON TABLE webhooks IS 'Armazena todos os webhooks recebidos da SkalePay';
COMMENT ON COLUMN webhooks.transaction_id IS 'ID da transação na SkalePay';
COMMENT ON COLUMN webhooks.status IS 'Status do pagamento (pending, paid, failed, etc.)';
COMMENT ON COLUMN webhooks.event_type IS 'Tipo do evento do webhook';
COMMENT ON COLUMN webhooks.headers IS 'Headers HTTP da requisição do webhook';
COMMENT ON COLUMN webhooks.body IS 'Corpo completo do webhook em JSON';
COMMENT ON COLUMN webhooks.processed IS 'Se o webhook já foi processado pela aplicação';
