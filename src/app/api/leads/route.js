import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const source = searchParams.get('source');

        let queryStr = `
            SELECT l.*, c.first_name, c.last_name, c.email, c.company,
                   u.name as assigned_to_name
            FROM leads l
            LEFT JOIN contacts c ON l.contact_id = c.id
            LEFT JOIN users u ON l.assigned_to = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            queryStr += ` AND l.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (priority) {
            queryStr += ` AND l.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        if (source) {
            queryStr += ` AND l.source = $${paramCount}`;
            params.push(source);
            paramCount++;
        }

        queryStr += ' ORDER BY l.created_at DESC';

        const leads = await pool.query(queryStr, params);
        return NextResponse.json({ leads: leads.rows });
    } catch (error) {
        console.error('Get leads error:', error);
        return NextResponse.json({ error: 'Server error', leads: [] }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            contact_id, title, value, currency, status, priority, source,
            expected_close_date, probability, assigned_to, notes
        } = body;

        const result = await pool.query(
            `INSERT INTO leads (
                contact_id, title, value, currency, status, priority, source,
                expected_close_date, probability, assigned_to, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                contact_id || null, title, value || 0.00, currency || 'USD', status || 'new',
                priority || 'medium', source || null, expected_close_date || null, probability || 50,
                assigned_to || decoded.id, notes || null, decoded.id
            ]
        );

        return NextResponse.json({
            message: 'Lead created successfully',
            lead: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create lead error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}