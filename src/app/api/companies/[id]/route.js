import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single company
export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        const companies = await pool.query(
            `SELECT c.*, creator.name as created_by_name 
             FROM companies c 
             LEFT JOIN users creator ON c.created_by = creator.id
             WHERE c.id = $1`,
            [id]
        );

        if (companies.rows.length === 0) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json({ company: companies.rows[0] });
    } catch (error) {
        console.error('Get company error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update company
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const {
            name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes
        } = body;

        await pool.query(
            `UPDATE companies SET 
                name = $1, industry = $2, website = $3, phone = $4, email = $5, address = $6, city = $7, state = $8, country = $9, postal_code = $10, employee_count = $11, annual_revenue = $12, notes = $13
             WHERE id = $14`,
            [
                name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes, id
            ]
        );

        return NextResponse.json({ message: 'Company updated successfully' });
    } catch (error) {
        console.error('Update company error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE company
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        await pool.query('DELETE FROM companies WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Delete company error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
