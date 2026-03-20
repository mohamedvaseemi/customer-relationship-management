import pg from 'pg';

const { Pool } = pg;

// Determine SSL configuration
const getSSLConfig = () => {
    // For cloud databases (Aiven, AWS RDS, DigitalOcean, etc.)
    if (process.env.DB_SSL === 'true') {
        return {
            rejectUnauthorized: false,
            require: true
        };
    }
    return false;
};

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm',
    port: parseInt(process.env.DB_PORT) || 5432,
    max: 20, // Increased for better performance
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000, // Reduced from 10000 to fail faster
    ssl: getSSLConfig()
};

if (!global._pgPool) {
    console.log('🏗️ Initializing new PostgreSQL pool...');
    global._pgPool = new Pool(poolConfig);
}

const pool = global._pgPool;

// Listen for pool errors
pool.on('error', (err) => {
    console.error('💥 Unexpected error on idle client', err);
});

// Helper function to execute queries
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV !== 'production') {
            const querySnippet = text.substring(0, 50).replace(/\n/g, ' ');
            console.log(`[DB] ${duration}ms | ${querySnippet}... | Rows: ${res.rowCount}`);
        }
        
        return res;
    } catch (error) {
        console.error('❌ Database Query Error:', {
            text: text.substring(0, 100),
            error: error.message
        });
        throw error;
    }
};

export const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL database connected successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        return false;
    }
};

export default pool;
