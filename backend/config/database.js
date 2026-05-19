import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── SSL Configuration ────────────────────────────────────────────────────────
const getSSLConfig = () => {
    if (process.env.DB_SSL === 'true') {
        return { rejectUnauthorized: false, require: true };
    }
    return false;
};

// ─── Connection Pool ──────────────────────────────────────────────────────────
// Optimized for Aiven free-tier (limited connections)
const pool = new Pool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     parseInt(process.env.DB_PORT) || 5432,
    ssl:      getSSLConfig(),

    // Pool sizing — keep small for free-tier limits
    max:                 5,
    min:                 1,
    idleTimeoutMillis:   600000,   // 10 min — keep idle connections alive longer
    connectionTimeoutMillis: 15000, // 15 sec to establish
    keepAlive:           true,
    keepAliveInitialDelayMillis: 10000,
});

// ─── Keep-Alive Ping (prevents Aiven free-tier shutdown) ─────────────────────
// Aiven free tier suspends after ~1h of inactivity. We ping every 4 minutes.
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

const startKeepAlive = () => {
    const interval = setInterval(async () => {
        try {
            await pool.query('SELECT 1');
        } catch (err) {
            console.warn('⚠️  Keep-alive ping failed:', err.message);
        }
    }, KEEP_ALIVE_INTERVAL_MS);

    // Don't block process exit
    if (interval.unref) interval.unref();

    console.log('💓 DB keep-alive ping started (every 4 min)');
};

// ─── Schema Auto-Initialisation ───────────────────────────────────────────────
const SCHEMA_FILES = [
    'schema.sql',
    'tickets_schema.sql',
    'chat_schema.sql',
    'lead_intelligence_schema.sql',
    'automations_schema.sql',
    'marketing_schema.sql',
];

const initSchema = async () => {
    for (const file of SCHEMA_FILES) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.log(`   ⏭  Skipping ${file} (not found)`);
            continue;
        }
        try {
            const sql = fs.readFileSync(filePath, 'utf8');
            await pool.query(sql);
            console.log(`   ✅ ${file} applied`);
        } catch (err) {
            // Non-fatal — some DDL errors are expected on repeated runs
            console.warn(`   ⚠️  ${file} warning: ${err.message}`);
        }
    }
};

// ─── Connect with Retry ───────────────────────────────────────────────────────
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const testConnection = async () => {
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`🔌 [${attempt}/${MAX_RETRIES}] Connecting to PostgreSQL...`);
            console.log(`   Host: ${process.env.DB_HOST}`);
            console.log(`   Port: ${process.env.DB_PORT}`);
            console.log(`   DB:   ${process.env.DB_NAME}`);
            console.log(`   SSL:  ${process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled'}`);

            const client = await pool.connect();
            console.log('✅ PostgreSQL connected successfully');
            client.release();

            // Auto-create tables if they don't exist
            console.log('\n📐 Initialising schema (CREATE TABLE IF NOT EXISTS)...');
            await initSchema();
            console.log('🗄️  Schema ready\n');

            // Start keep-alive pings
            startKeepAlive();
            return;
        } catch (error) {
            lastError = error;
            console.error(`❌ Connection attempt ${attempt} failed: ${error.message}`);
            if (attempt < MAX_RETRIES) {
                console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await sleep(RETRY_DELAY_MS);
            }
        }
    }

    console.error('💀 All connection attempts failed. Last error:', lastError);
    console.error('💡 Check your DB credentials in .env / environment variables.');
    process.exit(1);
};

// ─── Query Helper ─────────────────────────────────────────────────────────────
const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
        console.log('SQL', { text: text.substring(0, 60), duration: `${duration}ms`, rows: res.rowCount });
    }
    return res;
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const closePool = async () => {
    console.log('\n🔌 Closing DB pool...');
    await pool.end();
    console.log('✅ DB pool closed');
};

process.on('SIGINT',  closePool);
process.on('SIGTERM', closePool);

export { pool, query, testConnection, closePool };
