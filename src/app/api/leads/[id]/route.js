import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single lead
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        const leads = await pool.query(
            `SELECT l.*, c.first_name, c.last_name, c.email, c.company, c.phone,
                    u.name as assigned_to_name
             FROM leads l
             LEFT JOIN contacts c ON l.contact_id = c.id
             LEFT JOIN users u ON l.assigned_to = u.id
             WHERE l.id = $1`,
            [id]
        );

        if (leads.rows.length === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ lead: leads.rows[0] });
    } catch (error) {
        console.error('Get lead error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT: Update lead + Audit Log Stage Changes
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const {
            contact_id, title, value, currency, status, priority, source,
            expected_close_date, probability, assigned_to, notes
        } = body;

        // Fetch current lead state for audit comparison
        const currentLeadRes = await pool.query('SELECT status FROM leads WHERE id = $1', [id]);
        if (currentLeadRes.rows.length === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        const oldStatus = currentLeadRes.rows[0].status;

        // Update Lead
        const updatedRes = await pool.query(
            `UPDATE leads SET 
                contact_id = $1, title = $2, value = $3, currency = $4, status = $5,
                priority = $6, source = $7, expected_close_date = $8, probability = $9,
                assigned_to = $10, notes = $11, updated_at = CURRENT_TIMESTAMP
             WHERE id = $12
             RETURNING *`,
            [
                contact_id, title, value, currency, status, priority, source,
                expected_close_date, probability, assigned_to, notes, id
            ]
        );

        // Audit Trail: Log status change if updated via Kanban drag & drop
        if (status && oldStatus !== status) {
            await pool.query(
                `INSERT INTO lead_activity_logs (lead_id, user_id, action, old_value, new_value)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, decoded.id, 'STATUS_CHANGE', oldStatus, status]
            );
        }

        return NextResponse.json({ 
            message: 'Lead updated successfully',
            lead: updatedRes.rows[0]
        });
    } catch (error) {
        console.error('Update lead error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE lead
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        await pool.query('DELETE FROM leads WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete lead error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}