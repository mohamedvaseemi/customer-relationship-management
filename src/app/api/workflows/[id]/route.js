import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// PATCH toggle workflow status
export async function PATCH(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { is_active } = body;

        const result = await pool.query(
            'UPDATE workflow_rules SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Workflow rule not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Update workflow error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE a workflow rule
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        await pool.query('DELETE FROM workflow_rules WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Workflow deleted' });
    } catch (error) {
        console.error('Delete workflow error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
