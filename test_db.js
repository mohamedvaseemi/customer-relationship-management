const pg = require('pg');

const test = async () => {
    console.log('Testing connection to Aiven...');
    const pool = new pg.Pool({
        host: 'pg-3289bd69-personal-organization.e.aivencloud.com',
        user: 'avnadmin',
        password: 'AVNS_OnHSXGYG66qoe1VZT5l',
        database: 'defaultdb',
        port: 16888,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const res = await pool.query('SELECT 1 FROM pg_database');
        console.log('Successfully connected to defaultdb');
    } catch (e) {
        console.error('Failed to connect to defaultdb:', e.message);
    }

    const pool2 = new pg.Pool({
        host: 'pg-3289bd69-personal-organization.e.aivencloud.com',
        user: 'avnadmin',
        password: 'AVNS_OnHSXGYG66qoe1VZT5l',
        database: 'postgres',
        port: 16888,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const res = await pool2.query('SELECT 1 FROM pg_database');
        console.log('Successfully connected to postgres');
    } catch (e) {
        console.error('Failed to connect to postgres:', e.message);
    }
    
    process.exit(0);
};

test();
