import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied. Invalid or missing token.' }, { status: 401 });
        }

        const users = await pool.query(
            'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
            [decoded.id]
        );

        if (users.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: users.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
