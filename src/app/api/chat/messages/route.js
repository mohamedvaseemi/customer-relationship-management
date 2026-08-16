import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { searchParams } = req.nextUrl;
        const channelId = searchParams.get('channel_id');

        if (!channelId) {
            return NextResponse.json({ error: 'channel_id parameter is required' }, { status: 400 });
        }

        const result = await pool.query(
            `SELECT m.*, u.name as sender_name, u.email as sender_email
             FROM chat_messages m
             LEFT JOIN users u ON m.sender_id = u.id
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

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { channel_id, message } = await req.json();

        if (!channel_id || !message || !message.trim()) {
            return NextResponse.json({ error: 'channel_id and message are required' }, { status: 400 });
        }

        const insertRes = await pool.query(
            `INSERT INTO chat_messages (channel_id, sender_id, message) 
             VALUES ($1, $2, $3) RETURNING *`,
            [channel_id, decoded.id, message.trim()]
        );

        // Fetch back complete message row with sender's name
        const completeMsg = await pool.query(
            `SELECT m.*, u.name as sender_name, u.email as sender_email
             FROM chat_messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.id = $1`,
            [insertRes.rows[0].id]
        );

        return NextResponse.json({ message: completeMsg.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}