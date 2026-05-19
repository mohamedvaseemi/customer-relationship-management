import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { templateId } = await params;

        const result = await pool.query(
            'SELECT * FROM automation_tasks WHERE template_id = $1 ORDER BY step_order ASC',
            [templateId]
        );
        return NextResponse.json({ tasks: result.rows });
    } catch (error) {
        console.error('Get template tasks error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
