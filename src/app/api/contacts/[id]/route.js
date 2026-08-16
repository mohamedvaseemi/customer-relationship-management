import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single contact
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const result = await pool.query(
            `SELECT c.*, u.name as assigned_to_name
             FROM contacts c
             LEFT JOIN users u ON c.assigned_to = u.id
             WHERE c.id = $1 AND c.is_deleted = FALSE`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({ contact: result.rows[0] });
    } catch (error) {
        console.error('Get contact error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT: Update contact
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const {
            first_name, last_name, email, phone, company, position,
            address, city, state, country, postal_code, source, status, assigned_to, notes
        } = body;

        const result = await pool.query(
            `UPDATE contacts SET
                first_name = $1, last_name = $2, email = $3, phone = $4, company = $5,
                position = $6, address = $7, city = $8, state = $9, country = $10,
                postal_code = $11, source = $12, status = $13, assigned_to = $14,
                notes = $15, updated_at = CURRENT_TIMESTAMP
             WHERE id = $16 AND is_deleted = FALSE
             RETURNING *`,
            [
                first_name, last_name, email, phone, company, position,
                address, city, state, country, postal_code, source, status,
                assigned_to, notes, id
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Contact updated successfully', contact: result.rows[0] });
    } catch (error) {
        console.error('Update contact error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE: Soft delete contact
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { id } = await params;
        const { searchParams } = req.nextUrl;
        const permanent = searchParams.get('permanent') === 'true';

        if (permanent) {
            await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
        } else {
            await pool.query('UPDATE contacts SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        }

        return NextResponse.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Delete contact error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}