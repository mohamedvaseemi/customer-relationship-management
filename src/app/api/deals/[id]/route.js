import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single deal
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        const deals = await pool.query(
            `SELECT d.*, c.first_name, c.last_name, u.name as assigned_to_name, creator.name as created_by_name 
             FROM deals d 
             LEFT JOIN contacts c ON d.contact_id = c.id 
             LEFT JOIN users u ON d.assigned_to = u.id 
             LEFT JOIN users creator ON d.created_by = creator.id
             WHERE d.id = $1`,
            [id]
        );

        if (deals.rows.length === 0) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json({ deal: deals.rows[0] });
    } catch (error) {
        console.error('Get deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update deal
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const {
            name, amount, currency, stage, probability, expected_close_date, actual_close_date, contact_id, lead_id, assigned_to, notes
        } = body;

        await pool.query(
            `UPDATE deals SET 
                name = $1, amount = $2, currency = $3, stage = $4, probability = $5, expected_close_date = $6, actual_close_date = $7, contact_id = $8, lead_id = $9, assigned_to = $10, notes = $11
             WHERE id = $12`,
            [
                name, amount, currency, stage, probability, expected_close_date, actual_close_date, contact_id, lead_id, assigned_to, notes, id
            ]
        );

        return NextResponse.json({ message: 'Deal updated successfully' });
    } catch (error) {
        console.error('Update deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE deal
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        await pool.query('DELETE FROM deals WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        console.error('Delete deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
