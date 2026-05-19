import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_leads,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
                SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
                SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_leads,
                SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_leads,
                COALESCE(SUM(value), 0) as total_value,
                COALESCE(AVG(probability), 0) as avg_probability
            FROM leads
        `);

        return NextResponse.json({ stats: stats.rows[0] });
    } catch (error) {
        console.error('Get lead stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
