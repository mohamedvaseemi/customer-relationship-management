import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const result = await pool.query(
            'SELECT id, first_name, last_name, email, updated_at FROM contacts WHERE is_deleted = true ORDER BY updated_at DESC'
        );
        return NextResponse.json({ contacts: result.rows });
    } catch (error) {
        console.error('Get deleted contacts error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
