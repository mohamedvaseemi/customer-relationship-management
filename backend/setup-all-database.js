import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const schemaFiles = [
    'schema.sql',
    'deals_schema.sql',
    'tickets_schema.sql',
    'chat_schema.sql',
    'lead_intelligence_schema.sql',
    'automations_schema.sql'
];

async function setup() {
    for (const file of schemaFiles) {
        const filePath = path.join('config', file);
        if (fs.existsSync(filePath)) {
            console.log(`Running ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf8');
            try {
                await pool.query(sql);
                console.log(`${file} completed.`);
            } catch (err) {
                console.warn(`Warning running ${file}:`, err.message);
            }
        } else {
            console.log(`Skip ${file} (not found)`);
        }
    }
    process.exit();
}

setup();
