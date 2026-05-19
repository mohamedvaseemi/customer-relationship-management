import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all activities
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const contact_id = searchParams.get('contact_id');
        const lead_id = searchParams.get('lead_id');

        let queryStr = `
            SELECT a.*, c.first_name, c.last_name, c.email,
                   u.name as assigned_to_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN users u ON a.assigned_to = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (type) {
            queryStr += ` AND a.type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        if (status) {
            queryStr += ` AND a.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (contact_id) {
            queryStr += ` AND a.contact_id = $${paramCount}`;
            params.push(contact_id);
            paramCount++;
        }

        if (lead_id) {
            queryStr += ` AND a.lead_id = $${paramCount}`;
            params.push(lead_id);
            paramCount++;
        }

        queryStr += ' ORDER BY a.due_date DESC, a.created_at DESC';

        const activities = await pool.query(queryStr, params);
        return NextResponse.json({ activities: activities.rows });
    } catch (error) {
        console.error('Get activities error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create activity
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            type, subject, description, contact_id, lead_id, assigned_to,
            status, priority, due_date
        } = body;

        const result = await pool.query(
            `INSERT INTO activities (
                type, subject, description, contact_id, lead_id, assigned_to,
                status, priority, due_date, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                type, subject, description, contact_id, lead_id, assigned_to,
                status || 'pending', priority || 'medium', due_date, decoded.id
            ]
        );

        return NextResponse.json({
            message: 'Activity created successfully',
            activity: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
