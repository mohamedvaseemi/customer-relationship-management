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
        const { channel_id, content, is_bot } = body;

        const result = await pool.query(
            `INSERT INTO chat_messages (channel_id, sender_id, content, is_bot)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [channel_id, decoded.id, content, is_bot || false]
        );
        return NextResponse.json({ message: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
