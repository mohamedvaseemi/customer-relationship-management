import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        // Run all queries fully in parallel - removed duplicate leadsByStatus query
        const queries = [
            pool.query(`
                SELECT COUNT(*) as total_contacts,
                       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contacts
                FROM contacts
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total_leads,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
                    SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
                    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_leads,
                    COALESCE(SUM(value), 0) as total_pipeline_value
                FROM leads
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total_deals,
                    COALESCE(SUM(CASE WHEN stage = 'closed_won' THEN amount ELSE 0 END), 0) as won_amount,
                    COALESCE(SUM(CASE WHEN stage != 'closed_won' AND stage != 'closed_lost' THEN amount ELSE 0 END), 0) as pending_amount
                FROM deals
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total_activities,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_activities,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_activities
                FROM activities
            `),
            pool.query(`
                SELECT a.*, c.first_name, c.last_name, u.name as assigned_to_name
                FROM activities a
                LEFT JOIN contacts c ON a.contact_id = c.id
                LEFT JOIN users u ON a.assigned_to = u.id
                ORDER BY a.created_at DESC
                LIMIT 10
            `),
            pool.query(`
                SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count
                FROM leads
                WHERE created_at >= NOW() - INTERVAL 6 MONTH
                GROUP BY DATE_FORMAT(created_at, '%b'), DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY DATE_FORMAT(created_at, '%Y-%m')
            `),
            pool.query(`
                SELECT DATE_FORMAT(created_at, '%b') as month, COALESCE(SUM(amount), 0) as total
                FROM deals
                WHERE stage = 'closed_won' AND created_at >= NOW() - INTERVAL 6 MONTH
                GROUP BY DATE_FORMAT(created_at, '%b'), DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY DATE_FORMAT(created_at, '%Y-%m')
            `),
            pool.query(`
                SELECT status, COUNT(*) as count
                FROM leads
                GROUP BY status
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total_tickets,
                    SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets
                FROM tickets
            `),
            pool.query(`
                SELECT * FROM activities 
                WHERE type = 'task' AND status = 'pending'
                ORDER BY due_date ASC
                LIMIT 5
            `),
            pool.query(`
                SELECT * FROM activities 
                WHERE type = 'meeting' AND status = 'pending' AND due_date >= CURRENT_TIMESTAMP
                ORDER BY due_date ASC
                LIMIT 5
            `),
            pool.query('SELECT 1'),
            pool.query(`
                SELECT COUNT(*) as count 
                FROM leads
                WHERE is_deleted = 0 
                  AND status NOT IN ('won', 'lost')
                  AND id NOT IN (
                      SELECT DISTINCT lead_id 
                      FROM activities 
                      WHERE created_at >= NOW() - INTERVAL 14 DAY 
                        AND lead_id IS NOT NULL 
                        AND is_deleted = 0
                  )
            `)
        ];

        const results = await Promise.allSettled(queries);

        const contacts         = results[0].status  === 'fulfilled' ? results[0].value.rows[0]  : {};
        const leads            = results[1].status  === 'fulfilled' ? results[1].value.rows[0]  : {};
        const deals            = results[2].status  === 'fulfilled' ? results[2].value.rows[0]  : {};
        const activities       = results[3].status  === 'fulfilled' ? results[3].value.rows[0]  : {};
        const recentRows       = results[4].status  === 'fulfilled' ? results[4].value.rows     : [];
        const leadsTrend       = results[5].status  === 'fulfilled' ? results[5].value.rows     : [];
        const revenueTrend     = results[6].status  === 'fulfilled' ? results[6].value.rows     : [];
        const leadsByStatus    = results[7].status  === 'fulfilled' ? results[7].value.rows     : [];
        const tickets          = results[8].status  === 'fulfilled' ? results[8].value.rows[0]  : {};
        const openTasks        = results[9].status  === 'fulfilled' ? results[9].value.rows     : [];
        const upcomingMeetings = results[10].status === 'fulfilled' ? results[10].value.rows    : [];
        const dbConnected      = results[11].status === 'fulfilled';
        const staleLeadsCount  = dbConnected && results[12].status === 'fulfilled'
            ? parseInt(results[12].value.rows[0]?.count || 0) : 0;

        const response = NextResponse.json({
            dbConnected,
            staleLeadsCount,
            stats: {
                contacts:   contacts   || {},
                leads:      leads      || {},
                deals:      deals      || {},
                activities: activities || {},
                tickets:    tickets    || {}
            },
            openTasks,
            upcomingMeetings,
            recentActivities: recentRows,
            leadsByStatus,
            trends: {
                leads:   leadsTrend,
                revenue: revenueTrend
            }
        });

        // Cache for 30s, allow stale-while-revalidate for 60s (private — per-user data)
        response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
        return response;

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
