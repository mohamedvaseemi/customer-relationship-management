import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { lead_id, action, old_value, new_value } = body;

        const result = await pool.query(
            `INSERT INTO lead_activity_logs (lead_id, user_id, action, old_value, new_value)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [lead_id, decoded.id, action, old_value, new_value]
        );
        return NextResponse.json({ log: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Log activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
