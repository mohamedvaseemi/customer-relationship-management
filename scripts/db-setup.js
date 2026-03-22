const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function setup() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    const schemas = [
      'schema.sql',
      'tickets_schema.sql',
      'automations_schema.sql',
      'chat_schema.sql',
      'lead_intelligence_schema.sql',
      'marketing_schema.sql'
    ];

    for (const schemaFile of schemas) {
      console.log(`Reading ${schemaFile}...`);
      const schemaPath = path.join(__dirname, '../backend/config', schemaFile);
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log(`Initializing ${schemaFile}...`);
        await client.query(schemaSql);
        console.log(`${schemaFile} initialized successfully.`);
      } else {
        console.warn(`Warning: ${schemaFile} not found.`);
      }
    }

    // Add columns if they were missed (from the migrate route)
    console.log('Running additional migrations...');
    await client.query(`
        ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
            ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
            ADD COLUMN IF NOT EXISTS department VARCHAR(100),
            ADD COLUMN IF NOT EXISTS bio TEXT,
            ADD COLUMN IF NOT EXISTS location VARCHAR(150),
            ADD COLUMN IF NOT EXISTS timezone VARCHAR(80) DEFAULT 'UTC',
            ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
            ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(20) DEFAULT '#6366f1',
            ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email":true,"browser":true,"deals":true,"leads":true}',
            ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    `);

    // Create default admin user if not exists
    const adminEmail = 'admin@moderncrm.com';
    const checkUser = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (checkUser.rows.length === 0) {
      console.log('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('Admin user created (admin@moderncrm.com / Admin@123)');
    } else {
      console.log('Admin user already exists.');
    }

  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
