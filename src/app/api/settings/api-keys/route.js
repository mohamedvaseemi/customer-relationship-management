import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateApiKey, hashKey } from '@/lib/apiKeyUtils';
import { verifyAuth, adminOnly } from '@/lib/auth';

/**
 * GET - List all API keys (metadata only)
 * Requires admin JWT auth
 */
export async function GET(req) {
    const user = verifyAuth(req);
    if (!user || !adminOnly(user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await pool.query(`SELECT id, name, LEFT(key_hash, 12) AS prefix, scopes, is_active, created_at, last_used_at, expires_at FROM api_keys ORDER BY id DESC`);
    return NextResponse.json({ keys: result.rows }, { status: 200 });
}

/**
 * POST - Create a new API key
 * Body: { name: string, scopes?: string[], expires_in_days?: number }
 * Returns the raw key **once**
 */
export async function POST(req) {
    const user = verifyAuth(req);
    if (!user || !adminOnly(user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, scopes = [], expires_in_days } = await req.json();
    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);
    const expiresAt = expires_in_days ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000) : null;
    await pool.query(
        `INSERT INTO api_keys (name, key_hash, scopes, expires_at) VALUES (?, ?, ?, ?)`,
        [name, keyHash, JSON.stringify(scopes), expiresAt]
    );
    return NextResponse.json({ rawKey, name, scopes, expiresAt }, { status: 201 });
}

