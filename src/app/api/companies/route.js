import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all companies
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const industry = searchParams.get('industry');
        const search = searchParams.get('search');

        let queryStr = `
            SELECT c.*, u.name as created_by_name 
            FROM companies c 
            LEFT JOIN users u ON c.created_by = u.id 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (industry) {
            queryStr += ` AND c.industry = $${paramCount}`;
            params.push(industry);
            paramCount++;
        }

        if (search) {
            queryStr += ` AND (c.name ILIKE $${paramCount} OR c.website ILIKE $${paramCount + 1} OR c.city ILIKE $${paramCount + 2})`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
            paramCount += 3;
        }

        queryStr += ' ORDER BY c.created_at DESC';

        const companies = await pool.query(queryStr, params);
        return NextResponse.json({ companies: companies.rows });
    } catch (error) {
        console.error('Get companies error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create company
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes
        } = body;

        const result = await pool.query(
            `INSERT INTO companies (
                name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes, decoded.id
            ]
        );

        return NextResponse.json({
            message: 'Company created successfully',
            company: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create company error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
