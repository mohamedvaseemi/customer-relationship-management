import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const { status, priority, assigned_to } = await req.json();

        // Dynamically build the update query based on what was passed
        const result = await pool.query(
            `UPDATE tickets 
             SET status = COALESCE($1, status), 
                 priority = COALESCE($2, priority),
                 assigned_to = COALESCE($3, assigned_to),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [status, priority, assigned_to, id]
        );

        if (result.rows.length === 0) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        return NextResponse.json({ message: 'Ticket updated', ticket: result.rows[0] });
    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const result = await pool.query(`DELETE FROM tickets WHERE id = $1 RETURNING id`, [id]);

        if (result.rowCount === 0) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        return NextResponse.json({ message: 'Ticket deleted' });
    } catch (error) {
        console.error('Delete ticket error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}