import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Fetch deals for the logged-in user's company
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const companyId = decoded.company_id || null;
        const userId = decoded.id;

        const { searchParams } = req.nextUrl;
        const stage = searchParams.get('stage');

        let queryStr = `
            SELECT d.*, 
                   c.first_name, c.last_name, c.company as company_name, c.email as contact_email,
                   u.name as assigned_to_name
            FROM deals d
            LEFT JOIN contacts c ON d.contact_id = c.id
            LEFT JOIN users u ON d.assigned_to = u.id
            LEFT JOIN users creator ON d.created_by = creator.id
            WHERE ($1::int IS NULL OR creator.company_id = $1::int OR u.company_id = $1::int OR d.created_by = $2::int)
        `;
        const params = [companyId, userId];
        let paramCount = 3;

        if (stage) {
            queryStr += ` AND d.stage = $${paramCount}`;
            params.push(stage);
            paramCount++;
        }

        queryStr += ' ORDER BY d.created_at DESC';

        const result = await pool.query(queryStr, params);
        return NextResponse.json({ deals: result.rows });
    } catch (error) {
        console.error('Get deals error:', error);
        return NextResponse.json({ error: 'Server error', deals: [] }, { status: 500 });
    }
}

// POST: Create a new deal
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, amount, currency, stage, probability,
            expected_close_date, contact_id, lead_id, assigned_to, notes
        } = body;

        if (!name) {
            return NextResponse.json({ error: 'Deal name is required' }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO deals (
                name, amount, currency, stage, probability,
                expected_close_date, contact_id, lead_id, assigned_to, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                name, amount || 0.00, currency || 'USD', stage || 'prospecting',
                probability || 50, expected_close_date || null, contact_id || null,
                lead_id || null, assigned_to || decoded.id, notes || null, decoded.id
            ]
        );

        return NextResponse.json({
            message: 'Deal created successfully',
            deal: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create deal error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}