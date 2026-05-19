import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET custom fields for a module OR GET specific field
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { module } = await params;

        // Check if it's an integer ID or module name
        const isId = /^\d+$/.test(module);

        if (isId) {
            const result = await pool.query(
                'SELECT * FROM custom_fields WHERE id = $1',
                [parseInt(module)]
            );
            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
            }
            return NextResponse.json(result.rows[0]);
        } else {
            const result = await pool.query(
                'SELECT * FROM custom_fields WHERE module_name = $1 AND is_active = true ORDER BY created_at ASC',
                [module]
            );
            return NextResponse.json({ fields: result.rows });
        }
    } catch (error) {
        console.error('Get custom fields error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update custom field
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { module } = await params; // Here 'module' acts as ID
        const isId = /^\d+$/.test(module);

        if (!isId) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await req.json();
        const { is_active, field_label, is_mandatory } = body;

        const result = await pool.query(
            `UPDATE custom_fields 
             SET is_active = COALESCE($1, is_active), 
                 field_label = COALESCE($2, field_label),
                 is_mandatory = COALESCE($3, is_mandatory)
             WHERE id = $4 RETURNING *`,
            [is_active, field_label, is_mandatory, parseInt(module)]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Update custom field error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE custom field
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { module } = await params; // Here 'module' acts as ID
        const isId = /^\d+$/.test(module);

        if (!isId) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await pool.query('DELETE FROM custom_fields WHERE id = $1', [parseInt(module)]);
        return NextResponse.json({ message: 'Custom field deleted successfully' });
    } catch (error) {
        console.error('Delete custom field error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
