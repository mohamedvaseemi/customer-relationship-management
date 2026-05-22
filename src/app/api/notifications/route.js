import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        let result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [decoded.id]
        );

        // If no notifications exist, seed a couple of default ones so the dropdown is not empty
        if (result.rows.length === 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES 
                 ($1, 'Welcome to Antigravity CRM', 'Explore your new dashboard, setup your website connection and manage leads.', 'system', 0),
                 ($1, 'Setup Company Profile', 'Please complete your business details in settings.', 'warning', 0)`,
                [decoded.id]
            );

            result = await pool.query(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
                [decoded.id]
            );
        }

        return NextResponse.json({ notifications: result.rows });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { action, id } = body;

        if (action === 'read_all') {
            await pool.query(
                'UPDATE notifications SET is_read = 1 WHERE user_id = $1',
                [decoded.id]
            );
            return NextResponse.json({ message: 'All notifications marked as read' });
        }

        if (id) {
            await pool.query(
                'UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2',
                [id, decoded.id]
            );
            return NextResponse.json({ message: 'Notification marked as read' });
        }

        return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
