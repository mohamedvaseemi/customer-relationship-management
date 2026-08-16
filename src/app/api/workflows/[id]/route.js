import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const { is_active } = await req.json();

        // Safe update query
        const result = await pool.query(
            `UPDATE workflow_rules 
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING *`,
            [is_active, id]
        );

        if (result.rows.length === 0) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

        return NextResponse.json({ message: 'Workflow status updated', workflow: result.rows[0] });
    } catch (error) {
        console.error('Toggle workflow error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        
        // Safe delete query
        const result = await pool.query(
            `DELETE FROM workflow_rules WHERE id = $1 RETURNING id`, 
            [id]
        );

        if (result.rowCount === 0) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

        return NextResponse.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
        console.error('Delete workflow error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}