import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Helper to ensure phone and avatar columns exist
async function ensureUserColumns() {
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        `);
    } catch (err) {
        console.error('Error ensuring user columns:', err);
    }
}

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        await ensureUserColumns();

        const result = await pool.query(
            `SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        await ensureUserColumns();

        const { name, phone } = await req.json();

        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 phone = COALESCE($2, phone), 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING id, name, email, role, phone`,
            [name, phone, decoded.id]
        );

        return NextResponse.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}