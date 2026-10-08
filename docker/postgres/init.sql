-- EggForm PostgreSQL initialization script
-- Runs once on first DB creation (docker-entrypoint-initdb.d)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- query performance monitoring

-- Create eggform role (already created via POSTGRES_USER, but ensure password works for app connections)
-- DO NOT do this in production — use separate app + admin roles with minimal privileges
ALTER USER eggform WITH SUPERUSER;

-- Default timezone
SET timezone TO 'Asia/Karachi';

-- Log configuration (helpful for debugging in dev)
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- log queries > 1s
ALTER SYSTEM SET log_line_prefix = '%t [%p]: user=%u,db=%d ';

-- Done
\echo 'EggForm PostgreSQL database initialized successfully.'
\echo 'Extensions enabled: uuid-ossp, pgcrypto, pg_stat_statements'
\echo 'Timezone set to: Asia/Karachi'
