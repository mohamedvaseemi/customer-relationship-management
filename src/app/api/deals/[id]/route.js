import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single deal by ID
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        const result = await pool.query(
            `SELECT d.*, 
                    c.first_name, c.last_name, c.company as company_name, c.email as contact_email,
                    u.name as assigned_to_name
             FROM deals d
             LEFT JOIN contacts c ON d.contact_id = c.id
             LEFT JOIN users u ON d.assigned_to = u.id
             WHERE d.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json({ deal: result.rows[0] });
    } catch (error) {
        console.error('Get deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT: Update deal stage, amount, or assigned user
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const {
            name, amount, currency, stage, probability,
            expected_close_date, contact_id, lead_id, assigned_to, notes
        } = body;

        const result = await pool.query(
            `UPDATE deals SET 
                name = $1, amount = $2, currency = $3, stage = $4,
                probability = $5, expected_close_date = $6, contact_id = $7,
                lead_id = $8, assigned_to = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
             WHERE id = $11
             RETURNING *`,
            [
                name, amount, currency, stage, probability,
                expected_close_date, contact_id, lead_id, assigned_to, notes, id
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Deal updated successfully',
            deal: result.rows[0]
        });
    } catch (error) {
        console.error('Update deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE: Remove deal
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        const result = await pool.query('DELETE FROM deals WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        console.error('Delete deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}