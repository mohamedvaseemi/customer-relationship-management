import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single activity
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const result = await pool.query(
            `SELECT a.*, u.name as assigned_to_name
             FROM activities a
             LEFT JOIN users u ON a.assigned_to = u.id
             WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ activity: result.rows[0] });
    } catch (error) {
        console.error('Get activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT: Update activity (status toggle, due date, priority)
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const {
            type, subject, description, contact_id, lead_id,
            assigned_to, status, priority, due_date
        } = body;

        const result = await pool.query(
            `UPDATE activities SET
                type = $1, subject = $2, description = $3, contact_id = $4,
                lead_id = $5, assigned_to = $6, status = $7, priority = $8,
                due_date = $9, updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             RETURNING *`,
            [
                type, subject, description, contact_id, lead_id,
                assigned_to, status, priority, due_date, id
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Activity updated successfully', activity: result.rows[0] });
    } catch (error) {
        console.error('Update activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE: Remove activity
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Delete activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}