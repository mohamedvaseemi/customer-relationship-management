import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        // Safe query fetching tickets + contact info + assignee info
        const result = await pool.query(
            `SELECT t.*, 
                    c.first_name as contact_first_name, c.last_name as contact_last_name,
                    u.name as assigned_to_name
             FROM tickets t
             LEFT JOIN contacts c ON t.contact_id = c.id
             LEFT JOIN users u ON t.assigned_to = u.id
             ORDER BY 
                CASE t.status 
                    WHEN 'open' THEN 1 
                    WHEN 'in_progress' THEN 2 
                    WHEN 'resolved' THEN 3 
                    ELSE 4 
                END, 
                t.created_at DESC`
        );

        return NextResponse.json({ tickets: result.rows });
    } catch (error) {
        console.error('Get tickets error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const body = await req.json();
        const { subject, description, priority, status, contact_id, assigned_to } = body;

        if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });

        const result = await pool.query(
            `INSERT INTO tickets (subject, description, priority, status, contact_id, assigned_to, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                subject, description || null, priority || 'medium', status || 'open', 
                contact_id || null, assigned_to || decoded.id, decoded.id
            ]
        );

        return NextResponse.json({ message: 'Ticket created', ticket: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}