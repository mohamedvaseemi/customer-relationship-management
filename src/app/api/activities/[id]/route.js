import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single activity
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        const activities = await pool.query(
            `SELECT a.*, c.first_name, c.last_name, c.email,
                    u.name as assigned_to_name
             FROM activities a
             LEFT JOIN contacts c ON a.contact_id = c.id
             LEFT JOIN users u ON a.assigned_to = u.id
             WHERE a.id = $1`,
            [id]
        );

        if (activities.rows.length === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ activity: activities.rows[0] });
    } catch (error) {
        console.error('Get activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update activity
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const {
            type, subject, description, contact_id, lead_id, assigned_to,
            status, priority, due_date, completed_at
        } = body;

        await pool.query(
            `UPDATE activities SET 
                type = $1, subject = $2, description = $3, contact_id = $4, lead_id = $5,
                assigned_to = $6, status = $7, priority = $8, due_date = $9, completed_at = $10
             WHERE id = $11`,
            [
                type, subject, description, contact_id, lead_id, assigned_to,
                status, priority, due_date, completed_at, id
            ]
        );

        return NextResponse.json({ message: 'Activity updated successfully' });
    } catch (error) {
        console.error('Update activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE activity
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        await pool.query('DELETE FROM activities WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Delete activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
