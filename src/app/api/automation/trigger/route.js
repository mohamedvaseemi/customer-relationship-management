import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { lead_id, template_id } = body;

        // Fetch automation tasks
        const tasks = await pool.query(
            'SELECT * FROM automation_tasks WHERE template_id = $1 ORDER BY step_order ASC',
            [template_id]
        );

        // Execute automation steps (create activities accordingly)
        for (const task of tasks.rows) {
            if (task.action_type === 'create_task') {
                await pool.query(
                    `INSERT INTO activities (lead_id, type, subject, status, due_date, created_by, assigned_to)
                     VALUES ($1, 'task', $2, 'pending', CURRENT_DATE + $3, $4, $5)`,
                    [lead_id, task.task_subject, task.delay_days || 0, decoded.id, decoded.id]
                );
            }
        }

        return NextResponse.json({ message: 'Automation sequence triggered successfully' });
    } catch (error) {
        console.error('Trigger automation error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
