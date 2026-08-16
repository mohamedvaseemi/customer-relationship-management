import pg from 'pg';

const getSSLConfig = () => {
    if (process.env.DB_SSL) {
        const sslVal = process.env.DB_SSL.trim().split(' ')[0].toLowerCase();
        if (sslVal === 'true' || sslVal === 'require' || sslVal === '1') {
            return { rejectUnauthorized: false };
        }
    }
    return false;
};

// Common connection options for stability on cloud databases (Aiven, Neon, Supabase)
const commonPoolConfig = {
    max: 10,
    idleTimeoutMillis: 20000,           // Close idle clients before cloud timeouts trigger (20s)
    connectionTimeoutMillis: 10000,     // Timeout after 10s if connection cannot be established
    keepAlive: true,                    // Send TCP keepalive packets to prevent silent drops
    keepAliveInitialDelayMillis: 10000, // Start keepalive after 10s of inactivity
};

const createPool = () => {
    // 1. Prefer individual DB_* environment variables
    if (process.env.DB_HOST) {
        return new pg.Pool({
            host: process.env.DB_HOST.trim(),
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: (process.env.DB_USER || '').trim(),
            password: (process.env.DB_PASSWORD || '').trim(),
            database: (process.env.DB_NAME || '').trim(),
            ssl: getSSLConfig() || { rejectUnauthorized: false },
            ...commonPoolConfig,
        });
    }

    // 2. Fallback to DATABASE_URL / POSTGRES_URL connection strings
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (connectionString) {
        return new pg.Pool({
            connectionString,
            ssl: getSSLConfig() || { rejectUnauthorized: false },
            ...commonPoolConfig,
        });
    }

    console.warn('⚠️ DB_HOST or DATABASE_URL not set in environment.');
    return new pg.Pool({ ...commonPoolConfig });
};

// Cache pool on globalThis for Next.js hot-reloading in development
const globalForPg = globalThis;
if (!globalForPg.postgresPool) {
    globalForPg.postgresPool = createPool();

    // Gracefully handle idle client disconnects from the cloud provider
    globalForPg.postgresPool.on('error', (err) => {
        const networkErrors = ['ETIMEDOUT', 'ECONNRESET', 'EPIPE', '57P01'];
        if (networkErrors.includes(err.code) || err.message?.includes('ETIMEDOUT')) {
            console.warn(`⚠️ PostgreSQL idle client disconnected gracefully (${err.code || 'ETIMEDOUT'}). Pool will reconnect on next query.`);
        } else {
            console.error('❌ Unexpected error on PostgreSQL client:', err.message);
        }
    });
}

export const pool = globalForPg.postgresPool;

// Helper query function with automatic error logging
export const query = async (text, params = []) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error('❌ Database Query Error:', {
            text: text.length > 100 ? text.substring(0, 100) + '...' : text,
            error: error.message
        });
        throw error;
    }
};