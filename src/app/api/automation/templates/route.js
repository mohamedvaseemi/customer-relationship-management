import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const result = await pool.query('SELECT * FROM automation_templates ORDER BY created_at DESC');
        return NextResponse.json({ templates: result.rows });
    } catch (error) {
        console.error('Get templates error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
