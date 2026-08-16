import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

async function ensureNotificationsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Automatically replace any legacy "Antigravity" entries in existing database rows
        await pool.query(`
            UPDATE notifications 
            SET title = REPLACE(title, 'Antigravity', 'Kibon'),
                message = REPLACE(message, 'Antigravity', 'Kibon')
            WHERE title ILIKE '%Antigravity%' OR message ILIKE '%Antigravity%'
        `);
    } catch (err) {
        console.error('Table verification failed:', err);
    }
}

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        await ensureNotificationsTable();

        let result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type) VALUES 
                 ($1, 'Welcome to Kibon CRM!', 'Your workspace is ready. Start tracking leads, deals, and activities.', 'system'),
                 ($1, 'Pipeline Velocity Optimal', 'Enterprise deals conversion rate is performing at 92%.', 'deal')`,
                [decoded.id]
            );
            result = await pool.query(
                `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25`,
                [decoded.id]
            );
        }

        const unreadCount = result.rows.filter(n => !n.is_read).length;
        return NextResponse.json({ notifications: result.rows, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'Server error', notifications: [], unreadCount: 0 }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        await pool.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [decoded.id]);
        return NextResponse.json({ message: 'All notifications marked as read' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    return PATCH(req);
}