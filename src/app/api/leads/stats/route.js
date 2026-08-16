import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const [
            leadsTrendRes,
            revenueTrendRes,
            leadsByStatusRes,
            openTasksRes,
            upcomingMeetingsRes,
            staleLeadsRes,
            ticketsRes
        ] = await Promise.all([
            // 1. Lead Trends (Last 6 Months)
            pool.query(`
                SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(id) as count
                FROM leads
                WHERE created_at >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
                ORDER BY EXTRACT(MONTH FROM created_at)
            `),

            // 2. Revenue Trends (Won Deals)
            pool.query(`
                SELECT TO_CHAR(created_at, 'Mon') as month, COALESCE(SUM(amount), 0) as total
                FROM deals
                WHERE stage = 'won' AND created_at >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
                ORDER BY EXTRACT(MONTH FROM created_at)
            `),

            // 3. Leads by Status
            pool.query(`
                SELECT status, COUNT(id) as count 
                FROM leads
                GROUP BY status
            `),

            // 4. Open Tasks
            pool.query(`
                SELECT id, subject, due_date, priority 
                FROM activities
                WHERE type = 'task' AND status != 'completed'
                ORDER BY due_date ASC 
                LIMIT 5
            `),

            // 5. Upcoming Meetings
            pool.query(`
                SELECT id, subject, due_date, priority 
                FROM activities
                WHERE type = 'meeting' AND due_date >= NOW()
                ORDER BY due_date ASC 
                LIMIT 5
            `),

            // 6. Stale Leads (No activity in 30 days)
            pool.query(`
                SELECT COUNT(l.id) as stale_count
                FROM leads l
                WHERE NOT EXISTS (
                    SELECT 1 FROM activities a 
                    WHERE a.lead_id = l.id AND a.created_at >= NOW() - INTERVAL '30 days'
                )
            `),

            // 7. Open Tickets
            pool.query(`
                SELECT COUNT(id) as open_tickets 
                FROM tickets
                WHERE status = 'open'
            `)
        ]);

        return NextResponse.json({
            dbConnected: true,
            trends: {
                leads: leadsTrendRes.rows,
                revenue: revenueTrendRes.rows
            },
            leadsByStatus: leadsByStatusRes.rows,
            openTasks: openTasksRes.rows,
            upcomingMeetings: upcomingMeetingsRes.rows,
            staleLeadsCount: parseInt(staleLeadsRes.rows[0]?.stale_count || 0, 10),
            stats: {
                tickets: {
                    open_tickets: parseInt(ticketsRes.rows[0]?.open_tickets || 0, 10)
                }
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Server error', dbConnected: false }, { status: 500 });
    }
}