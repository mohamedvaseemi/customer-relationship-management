import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
    try {
        const sqlPath = path.join(__dirname, '..', 'config', 'tickets_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running tickets_schema.sql...');
        await pool.query(sql);
        console.log('✅ Tickets table created successfully');
    } catch (error) {
        console.error('❌ Failed to create tickets table:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

setup();
