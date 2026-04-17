import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // Prevent static caching for authenticated data

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Helper to prevent a single hanging query from blocking the entire Dashboard
    const queryWithTimeout = async (sql, params = [], fallback = { rows: [] }) => {
        try {
            return await Promise.race([
                query(sql, params),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query Timeout')), 3500))
            ]);
        } catch (err) {
            console.warn(`⚠️ Dashboard Query Slow: ${sql.substring(0, 30)}... | Error: ${err.message}`);
            return fallback;
        }
    };

    try {
        // Run all DB queries in PARALLEL with individual timeouts
        const [
            leadsCount,
            dealsCount,
            totalValue,
            openTickets,
            openTasks,
            leadTrends,
            revenueTrends
        ] = await Promise.all([
            queryWithTimeout('SELECT COUNT(*) FROM leads', [], { rows: [{ count: 0 }] }),
            queryWithTimeout("SELECT COUNT(*) FROM deals WHERE stage = 'closed_won'", [], { rows: [{ count: 0 }] }),
            queryWithTimeout("SELECT SUM(amount) FROM deals WHERE stage = 'closed_won'", [], { rows: [{ sum: 0 }] }),
            queryWithTimeout("SELECT COUNT(*) FROM tickets WHERE status != 'closed'", [], { rows: [{ count: 0 }] }),
            queryWithTimeout(`
                SELECT id, subject, due_date, priority, status 
                FROM activities 
                WHERE status != 'completed' 
                ORDER BY due_date ASC 
                LIMIT 5
            `),
            queryWithTimeout(`
                SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count 
                FROM leads 
                WHERE created_at > NOW() - INTERVAL '6 months'
                GROUP BY month, date_trunc('month', created_at)
                ORDER BY date_trunc('month', created_at)
            `),
            queryWithTimeout(`
                SELECT TO_CHAR(created_at, 'Mon') as month, SUM(amount) as total 
                FROM deals 
                WHERE stage = 'closed_won' AND created_at > NOW() - INTERVAL '6 months'
                GROUP BY month, date_trunc('month', created_at)
                ORDER BY date_trunc('month', created_at)
            `)
        ]);


        const defaultLeads = [
            { month: 'Jan', count: 0 }, { month: 'Feb', count: 0 }, { month: 'Mar', count: 0 }
        ];
        const defaultRev = [
            { month: 'Jan', total: 0 }, { month: 'Feb', total: 0 }, { month: 'Mar', total: 0 }
        ];

        return Response.json({
            leadsSummary: {
                stats: {
                    total_leads: parseInt(leadsCount.rows[0].count) || 0,
                    total_deals: parseInt(dealsCount.rows[0].count) || 0,
                    total_value: parseFloat(totalValue.rows[0].sum) || 0
                }
            },
            stats: {
                tickets: { open_tickets: parseInt(openTickets.rows[0].count) || 0 }
            },
            upcomingMeetings: openTasks.rows.length > 0 ? openTasks.rows : [
                { id: 'mock1', subject: 'No pending tasks. Start prospecting!', due_date: null, priority: 'medium' }
            ],
            trends: {
                leads: leadTrends.rows.length > 0 ? leadTrends.rows : defaultLeads,
                revenue: revenueTrends.rows.length > 0 ? revenueTrends.rows.map(r => ({ ...r, total: parseFloat(r.total) })) : defaultRev
            }
        }, {
            headers: {
                // Cache for 60s on CDN edges, stale-while-revalidate for 30s
                'Cache-Control': 'private, max-age=60, stale-while-revalidate=30'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

