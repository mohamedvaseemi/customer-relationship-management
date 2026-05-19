import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all workflow rules
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const result = await pool.query('SELECT * FROM workflow_rules ORDER BY created_at DESC');
        return NextResponse.json({ rules: result.rows });
    } catch (error) {
        console.error('Get workflows error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create workflow rule
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { name, module, trigger_event, conditions, actions } = body;

        const result = await pool.query(
            `INSERT INTO workflow_rules (name, module, trigger_event, conditions, actions)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, module, trigger_event, JSON.stringify(conditions), JSON.stringify(actions)]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Create workflow error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
