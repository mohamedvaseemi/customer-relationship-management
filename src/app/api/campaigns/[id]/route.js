import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const { status } = await req.json();

        const result = await pool.query(
            `UPDATE campaigns SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

        return NextResponse.json({ message: 'Campaign status updated', campaign: result.rows[0] });
    } catch (error) {
        console.error('Update campaign error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const result = await pool.query(`DELETE FROM campaigns WHERE id = $1 RETURNING id`, [id]);

        if (result.rowCount === 0) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

        return NextResponse.json({ message: 'Campaign deleted' });
    } catch (error) {
        console.error('Delete campaign error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}