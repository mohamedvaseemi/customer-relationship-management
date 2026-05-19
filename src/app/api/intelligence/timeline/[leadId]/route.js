import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { leadId } = await params;

        const result = await pool.query(
            `SELECT lal.*, u.name as user_name
             FROM lead_activity_logs lal
             LEFT JOIN users u ON lal.user_id = u.id
             WHERE lal.lead_id = $1
             ORDER BY lal.created_at DESC`,
            [leadId]
        );
        return NextResponse.json({ timeline: result.rows });
    } catch (error) {
        console.error('Get timeline error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
