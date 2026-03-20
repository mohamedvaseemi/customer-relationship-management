import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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

// Create connection pool with SSL support for cloud databases
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: getSSLConfig()
});

// Test connection
const testConnection = async () => {
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Port: ${process.env.DB_PORT}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   User: ${process.env.DB_USER}`);
        console.log(`   SSL: ${process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled'}`);

        const client = await pool.connect();
        console.log('✅ PostgreSQL database connected successfully');
        console.log(`📊 Connected to: ${process.env.DB_NAME} at ${process.env.DB_HOST}`);
        client.release();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        console.error('💡 Check your database credentials and network connectivity');
        console.error('Error details:', error);
        process.exit(1);
    }
};

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    }
    return res;
};

export { pool, query, testConnection };
