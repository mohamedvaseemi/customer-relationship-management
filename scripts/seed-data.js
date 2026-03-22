const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  try {
    // 1. Seed Contacts
    console.log('Seeding contacts...');
    await client.query(`
      INSERT INTO contacts (first_name, last_name, email, company, position, status, source)
      VALUES 
      ('Sarah', 'Jenkins', 'sarah@techflow.com', 'TechFlow Inc.', 'CTO', 'active', 'referral'),
      ('John', 'Doe', 'john@abc.com', 'ABC Corp', 'Sales Manager', 'active', 'website'),
      ('Alex', 'Mercer', 'alex@helix.io', 'Helix.io', 'CEO', 'active', 'social_media')
    `);

    // 2. Seed Leads
    console.log('Seeding leads...');
    await client.query(`
      INSERT INTO leads (title, status, value, priority, source, contact_id)
      VALUES 
      ('Enterprise License Deal', 'qualified', 45000, 'high', 'referral', 1),
      ('Small Business Trial', 'new', 2500, 'medium', 'website', 2),
      ('Strategic Partnership', 'proposal', 120000, 'urgent', 'social_media', 3)
    `);

    // 3. Seed Deals
    console.log('Seeding deals...');
    await client.query(`
      INSERT INTO deals (name, amount, stage, probability, lead_id, contact_id)
      VALUES 
      ('Expansion Deal - TechFlow', 25000, 'closed_won', 100, 1, 1),
      ('Q4 Server Migration', 15000, 'prospecting', 20, 2, 2)
    `);

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
