import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all deals
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const stage = searchParams.get('stage');
        const search = searchParams.get('search');

        let queryStr = `
            SELECT d.*, c.first_name, c.last_name, u.name as assigned_to_name 
            FROM deals d 
            LEFT JOIN contacts c ON d.contact_id = c.id 
            LEFT JOIN users u ON d.assigned_to = u.id 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (stage) {
            queryStr += ` AND d.stage = $${paramCount}`;
            params.push(stage);
            paramCount++;
        }

        if (search) {
            queryStr += ` AND (d.name ILIKE $${paramCount} OR c.first_name ILIKE $${paramCount + 1} OR c.last_name ILIKE $${paramCount + 2})`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
            paramCount += 3;
        }

        queryStr += ' ORDER BY d.created_at DESC';

        const deals = await pool.query(queryStr, params);
        return NextResponse.json({ deals: deals.rows });
    } catch (error) {
        console.error('Get deals error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create deal
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, amount, currency, stage, probability, expected_close_date, contact_id, lead_id, assigned_to, notes
        } = body;

        const result = await pool.query(
            `INSERT INTO deals (
                name, amount, currency, stage, probability, expected_close_date, contact_id, lead_id, assigned_to, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                name, amount, currency || 'USD', stage || 'prospecting', probability || 50, expected_close_date, contact_id, lead_id, assigned_to, notes, decoded.id
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
