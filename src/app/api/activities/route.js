import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: List all activities/tasks/meetings with filters
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const companyId = decoded.company_id || null;
        const userId = decoded.id;

        const { searchParams } = req.nextUrl;
        const type = searchParams.get('type');       // 'task', 'meeting', 'call', 'email'
        const status = searchParams.get('status');   // 'pending', 'completed'
        const priority = searchParams.get('priority');

        let queryStr = `
            SELECT a.*, 
                   c.first_name as contact_first_name, c.last_name as contact_last_name, c.company as contact_company,
                   l.title as lead_title,
                   u.name as assigned_to_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN leads l ON a.lead_id = l.id
            LEFT JOIN users u ON a.assigned_to = u.id
            LEFT JOIN users creator ON a.created_by = creator.id
            WHERE ($1::int IS NULL OR creator.company_id = $1::int OR u.company_id = $1::int OR a.created_by = $2::int)
        `;
        const params = [companyId, userId];
        let paramCount = 3;

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

        if (priority) {
            queryStr += ` AND a.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        queryStr += ' ORDER BY a.due_date ASC, a.created_at DESC';

        const result = await pool.query(queryStr, params);
        return NextResponse.json({ activities: result.rows });
    } catch (error) {
        console.error('Get activities error:', error);
        return NextResponse.json({ error: 'Server error', activities: [] }, { status: 500 });
    }
}

// POST: Create a new activity/task
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            type, subject, description, contact_id, lead_id,
            assigned_to, status, priority, due_date
        } = body;

        if (!type || !subject) {
            return NextResponse.json({ error: 'Activity type and subject are required' }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO activities (
                type, subject, description, contact_id, lead_id,
                assigned_to, status, priority, due_date, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                type || 'task', subject, description || null, contact_id || null,
                lead_id || null, assigned_to || decoded.id, status || 'pending',
                priority || 'medium', due_date || null, decoded.id
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