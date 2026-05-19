import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }
        const body = await req.json();
        const { module_name, field_label, field_name, data_type, options, is_mandatory } = body;
        const result = await pool.query(
            `INSERT INTO custom_fields (module_name, field_label, field_name, data_type, options, is_mandatory)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [module_name, field_label, field_name, data_type, JSON.stringify(options), is_mandatory]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Field name already exists for this module' }, { status: 400 });
        }
        console.error('Create custom field error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
