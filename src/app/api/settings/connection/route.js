import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const result = await pool.query('SELECT backend_connected, backend_url, api_key FROM crm_settings ORDER BY id DESC LIMIT 1');
        const connection = result.rows[0] || {
            backend_connected: 0,
            backend_url: '',
            api_key: ''
        };

        return NextResponse.json({ connection });
    } catch (error) {
        console.error('Get connection settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { action, backend_url, api_key, backend_connected } = body;

        // If action is "test", we try to establish a quick connection
        if (action === 'test') {
            try {
                // Simple ping to the backend URL using the provided API key
                const axios = require('axios');
                const resp = await axios.get(backend_url, {
                    headers: { 'X-API-Key': api_key },
                    timeout: 5000
                });
                return NextResponse.json({ success: true, message: 'Backend connection test succeeded!' });
            } catch (err) {
                return NextResponse.json({ success: false, error: err.message }, { status: 400 });
            }
        }

        // Otherwise we save the settings
        const existing = await pool.query('SELECT id FROM crm_settings ORDER BY id DESC LIMIT 1');
        let result;

        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE crm_settings 
                 SET backend_connected = $1, backend_url = $2, api_key = $3
                 WHERE id = $4 RETURNING backend_connected, backend_url, api_key`,
                [
                    backend_connected ? 1 : 0,
                    backend_url || '',
                    api_key || '',
                    existing.rows[0].id
                ]
            );
        } else {
            result = await pool.query(
                `INSERT INTO crm_settings (
                    company_name, backend_connected, backend_url, api_key
                 ) VALUES ($1, $2, $3, $4) RETURNING backend_connected, backend_url, api_key`,
                [
                    'My Company',
                    backend_connected ? 1 : 0,
                    backend_url || '',
                    api_key || ''
                ]
            );
        }

        return NextResponse.json({
            message: 'Connection settings saved successfully',
            connection: result.rows[0]
        });
    } catch (error) {
        console.error('Save connection settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
