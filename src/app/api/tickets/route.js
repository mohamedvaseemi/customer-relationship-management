import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all tickets
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        let queryStr = `
            SELECT t.*, c.first_name, c.last_name, 
                   u.name as assigned_to_name
            FROM tickets t
            LEFT JOIN contacts c ON t.contact_id = c.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            queryStr += ` AND t.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (priority) {
            queryStr += ` AND t.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        queryStr += ' ORDER BY t.created_at DESC';

        const tickets = await pool.query(queryStr, params);
        return NextResponse.json({ tickets: tickets.rows });
    } catch (error) {
        console.error('Get tickets error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create ticket
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { subject, description, priority, contact_id, assigned_to } = body;

        const result = await pool.query(
            `INSERT INTO tickets (subject, description, priority, contact_id, assigned_to, created_by)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [subject, description, priority || 'medium', contact_id, assigned_to, decoded.id]
        );

        return NextResponse.json({ message: 'Ticket created', ticket: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
