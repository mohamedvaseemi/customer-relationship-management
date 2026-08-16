import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const companyId = decoded.company_id;

        // Run concurrent SQL queries isolated by Company ID
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
                SELECT TO_CHAR(l.created_at, 'Mon') as month, COUNT(l.id) as count
                FROM leads l
                JOIN users u ON (l.created_by = u.id OR l.assigned_to = u.id)
                WHERE u.company_id = $1 AND l.created_at >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(l.created_at, 'Mon'), EXTRACT(MONTH FROM l.created_at)
                ORDER BY EXTRACT(MONTH FROM l.created_at)
            `, [companyId]),

            // 2. Revenue Trends (Won Deals)
            pool.query(`
                SELECT TO_CHAR(d.created_at, 'Mon') as month, COALESCE(SUM(d.amount), 0) as total
                FROM deals d
                JOIN users u ON (d.created_by = u.id OR d.assigned_to = u.id)
                WHERE u.company_id = $1 AND d.stage = 'won' AND d.created_at >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(d.created_at, 'Mon'), EXTRACT(MONTH FROM d.created_at)
                ORDER BY EXTRACT(MONTH FROM d.created_at)
            `, [companyId]),

            // 3. Leads by Status for Pie Chart
            pool.query(`
                SELECT l.status, COUNT(l.id) as count 
                FROM leads l
                JOIN users u ON (l.created_by = u.id OR l.assigned_to = u.id)
                WHERE u.company_id = $1
                GROUP BY l.status
            `, [companyId]),

            // 4. Open Tasks
            pool.query(`
                SELECT a.id, a.subject, a.due_date, a.priority 
                FROM activities a
                WHERE a.type = 'task' AND a.status != 'completed' AND a.assigned_to = $1
                ORDER BY a.due_date ASC 
                LIMIT 5
            `, [decoded.id]),

            // 5. Upcoming Meetings
            pool.query(`
                SELECT a.id, a.subject, a.due_date, a.priority 
                FROM activities a
                WHERE a.type = 'meeting' AND a.due_date >= NOW() AND a.assigned_to = $1
                ORDER BY a.due_date ASC 
                LIMIT 5
            `, [decoded.id]),

            // 6. Stale Leads (No activity in 30 days)
            pool.query(`
                SELECT COUNT(l.id) as stale_count
                FROM leads l
                JOIN users u ON (l.created_by = u.id OR l.assigned_to = u.id)
                WHERE u.company_id = $1 AND NOT EXISTS (
                    SELECT 1 FROM activities a 
                    WHERE a.lead_id = l.id AND a.created_at >= NOW() - INTERVAL '30 days'
                )
            `, [companyId]),

            // 7. Open Tickets
            pool.query(`
                SELECT COUNT(t.id) as open_tickets 
                FROM tickets t
                JOIN users u ON (t.created_by = u.id OR t.assigned_to = u.id)
                WHERE u.company_id = $1 AND t.status = 'open'
            `, [companyId])
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