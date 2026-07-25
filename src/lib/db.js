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

const createPool = () => {
    // Prefer individual DB_* config if DB_HOST is present to avoid sslmode query string warnings & connection issues
    if (process.env.DB_HOST) {
        return new pg.Pool({
            host: process.env.DB_HOST.trim(),
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: (process.env.DB_USER || '').trim(),
            password: (process.env.DB_PASSWORD || '').trim(),
            database: (process.env.DB_NAME || '').trim(),
            ssl: getSSLConfig(),
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (connectionString) {
        return new pg.Pool({
            connectionString,
            ssl: getSSLConfig() || { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }

    throw new Error('Database configuration missing. Set DB_HOST or DATABASE_URL in environment.');
};

// Cache pool on globalThis for Next.js hot-reloading in development
const globalForPg = globalThis;
export const pool = globalForPg.postgresPool || createPool();

if (process.env.NODE_ENV !== 'production') {
    globalForPg.postgresPool = pool;
}

// Handle idle connection errors gracefully
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client:', err);
});

// Helper query function for CRUD operations
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


