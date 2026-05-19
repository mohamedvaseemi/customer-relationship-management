import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, priority, assigned_to } = body;

        await pool.query(
            `UPDATE tickets SET status = COALESCE($1, status), 
                               priority = COALESCE($2, priority),
                               assigned_to = COALESCE($3, assigned_to),
                               updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [status, priority, assigned_to, id]
        );

        return NextResponse.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
