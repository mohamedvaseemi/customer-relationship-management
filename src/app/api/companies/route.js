import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: List all company accounts
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const companyId = decoded.company_id || null;
        const userId = decoded.id;

        const result = await pool.query(
            `SELECT c.*, u.name as created_by_name
             FROM companies c
             LEFT JOIN users u ON c.created_by = u.id
             WHERE ($1::int IS NULL OR u.company_id = $1::int OR c.created_by = $2::int)
             ORDER BY c.created_at DESC`,
            [companyId, userId]
        );

        return NextResponse.json({ companies: result.rows });
    } catch (error) {
        console.error('Get companies error:', error);
        return NextResponse.json({ error: 'Server error', companies: [] }, { status: 500 });
    }
}

// POST: Create company account
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const body = await req.json();
        const {
            name, industry, website, phone, email, address, city,
            state, country, postal_code, employee_count, annual_revenue, notes
        } = body;

        if (!name) {
            return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO companies (
                name, industry, website, phone, email, address, city,
                state, country, postal_code, employee_count, annual_revenue, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                name, industry || null, website || null, phone || null, email || null,
                address || null, city || null, state || null, country || null,
                postal_code || null, employee_count || 0, annual_revenue || 0.00,
                notes || null, decoded.id
            ]
        );

        return NextResponse.json({ message: 'Company account created successfully', company: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create company error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}