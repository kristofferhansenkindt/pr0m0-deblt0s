import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_H5ztya4WPQTY@ep-cool-tree-acu3e9gi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(DATABASE_URL)

async function initDatabase() {
  try {
    console.log("🚀 Iniciando criação das tabelas...")

    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        data_nascimento VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Tabela users criada")

    // Criar tabela de sessões
    await sql`
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
      )
    `
    console.log("✅ Tabela sessions criada")

    // Criar tabela de veículos
    await sql`
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
      )
    `
    console.log("✅ Tabela vehicles criada")

    // Criar tabela de eventos
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) REFERENCES sessions(session_id),
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        step INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Tabela events criada")

    // Criar tabela de débitos
    await sql`
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
      )
    `
    console.log("✅ Tabela debitos criada")

    // Criar índices para performance
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_address)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)`

    console.log("✅ Índices criados")

    console.log("🎉 Banco de dados inicializado com sucesso!")

    // Testar uma inserção simples
    const testResult = await sql`SELECT NOW() as current_time`
    console.log("🔍 Teste de conexão:", testResult[0])
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error)
    throw error
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log("✅ Script executado com sucesso!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Erro no script:", error)
      process.exit(1)
    })
}

export { initDatabase }
