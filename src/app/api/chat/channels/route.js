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
            `SELECT c.* FROM chat_channels c
             JOIN channel_members cm ON c.id = cm.channel_id
             WHERE cm.user_id = $1`,
            [decoded.id]
        );
        return NextResponse.json({ channels: result.rows });
    } catch (error) {
        console.error('Get channels error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
