import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        let result = await pool.query(`SELECT * FROM chat_channels ORDER BY created_at ASC`);

        // Auto-seed default channels if empty
        if (result.rows.length === 0) {
            await pool.query(`
                INSERT INTO chat_channels (name, description, created_by) VALUES 
                ('general', 'Company-wide updates & chatter', $1),
                ('sales-deals', 'Live deal updates and pipeline discussions', $1),
                ('customer-support', 'Urgent client ticket escalations', $1)
            `, [decoded.id]);
            result = await pool.query(`SELECT * FROM chat_channels ORDER BY created_at ASC`);
        }

        return NextResponse.json({ channels: result.rows });
    } catch (error) {
        console.error('Get channels error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { name, description, is_private } = await req.json();
        if (!name) return NextResponse.json({ error: 'Channel name is required' }, { status: 400 });

        const cleanName = name.toLowerCase().replace(/\s+/g, '-');
        const result = await pool.query(
            `INSERT INTO chat_channels (name, description, is_private, created_by) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [cleanName, description || null, is_private || false, decoded.id]
        );

        return NextResponse.json({ message: 'Channel created', channel: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create channel error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}