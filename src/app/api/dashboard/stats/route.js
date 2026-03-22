import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Fetch real stats from DB
        const leadsCount = await query('SELECT COUNT(*) FROM leads');
        const dealsCount = await query("SELECT COUNT(*) FROM deals WHERE stage = 'closed_won'");
        const totalValue = await query("SELECT SUM(amount) FROM deals WHERE stage = 'closed_won'");
        const openTickets = await query("SELECT COUNT(*) FROM tickets WHERE status != 'closed'");

        // Real Tasks
        const openTasks = await query(`
            SELECT id, subject, due_date, priority, status 
            FROM activities 
            WHERE status != 'completed' 
            ORDER BY due_date ASC 
            LIMIT 5
        `);

        // Real Trends for Leads (last 6 months)
        const leadTrends = await query(`
            SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count 
            FROM leads 
            WHERE created_at > NOW() - INTERVAL '6 months'
            GROUP BY month, date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at)
        `);

        // Real Trends for Revenue (last 6 months)
        const revenueTrends = await query(`
            SELECT TO_CHAR(created_at, 'Mon') as month, SUM(amount) as total 
            FROM deals 
            WHERE stage = 'closed_won' AND created_at > NOW() - INTERVAL '6 months'
            GROUP BY month, date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at)
        `);

        // Fallback for trends if empty (for better UX when fresh)
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
        });
    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
