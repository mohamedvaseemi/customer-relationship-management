import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { channelId } = await params;

        const result = await pool.query(
            `SELECT m.*, u.name as sender_name, cn.first_name as customer_name
             FROM chat_messages m
             LEFT JOIN users u ON m.sender_id = u.id
             LEFT JOIN contacts cn ON m.customer_id = cn.id
             WHERE m.channel_id = $1
             ORDER BY m.created_at ASC`,
            [channelId]
        );
        return NextResponse.json({ messages: result.rows });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
