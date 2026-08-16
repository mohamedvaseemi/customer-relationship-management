import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateApiKey, hashKey } from '@/lib/apiKeyUtils';
import { verifyAuth } from '@/lib/auth'; 

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
        }

        const result = await pool.query(
            `SELECT id, name, key_prefix, scopes, last_used, created_at, expires_at, is_active 
             FROM api_keys 
             WHERE user_id = $1 ORDER BY created_at DESC`,
            [decoded.id]
        );

        return NextResponse.json({ keys: result.rows });
    } catch (error) {
        console.error('API Keys GET Error:', error);
        return NextResponse.json({ error: 'Server error fetching API keys' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
        }

        const body = await req.json();
        const { name, scopes, expiresInDays = 365 } = body;

        if (!name) {
            return NextResponse.json({ error: 'API Key name is required' }, { status: 400 });
        }

        // Generate Secure Key
        const { rawKey, hashedKey, prefix } = generateApiKey();
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));

        // Store hash in DB
        const result = await pool.query(
            `INSERT INTO api_keys (user_id, name, key_hash, key_prefix, scopes, expires_at) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, name, key_prefix, scopes, created_at, expires_at, is_active`,
            [decoded.id, name, hashedKey, prefix, JSON.stringify(scopes || ['read']), expiresAt]
        );

        // ONLY return the raw key ONCE during creation
        return NextResponse.json({ 
            message: 'API Key created successfully',
            key: result.rows[0],
            rawKey: rawKey 
        }, { status: 201 });

    } catch (error) {
        console.error('API Keys POST Error:', error);
        return NextResponse.json({ error: 'Server error generating API key' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
        }

        await pool.query('DELETE FROM api_keys WHERE id = $1 AND user_id = $2', [id, decoded.id]);

        return NextResponse.json({ message: 'API key revoked successfully' });
    } catch (error) {
        console.error('API Keys DELETE Error:', error);
        return NextResponse.json({ error: 'Server error revoking API key' }, { status: 500 });
    }
}