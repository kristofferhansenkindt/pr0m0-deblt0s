-- Script para limpar completamente o banco de dados
-- ATENÇÃO: Isso vai apagar TODOS os dados!

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Limpar todas as tabelas na ordem correta (respeitando foreign keys)
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE debitos CASCADE;
TRUNCATE TABLE debitos_gerados CASCADE;
TRUNCATE TABLE vehicles CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE utm_sessions CASCADE;
TRUNCATE TABLE utm_conversions CASCADE;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Resetar sequências (contadores de ID)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE debitos_id_seq RESTART WITH 1;
ALTER SEQUENCE debitos_gerados_id_seq RESTART WITH 1;

-- Verificar se as tabelas estão vazias
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'sessions' as tabela, COUNT(*) as registros FROM sessions
UNION ALL
SELECT 'vehicles' as tabela, COUNT(*) as registros FROM vehicles
UNION ALL
SELECT 'events' as tabela, COUNT(*) as registros FROM events
UNION ALL
SELECT 'debitos' as tabela, COUNT(*) as registros FROM debitos
UNION ALL
SELECT 'debitos_gerados' as tabela, COUNT(*) as registros FROM debitos_gerados;

SELECT '✅ Banco de dados limpo com sucesso!' as status;
