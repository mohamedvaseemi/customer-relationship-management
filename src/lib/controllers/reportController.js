import { query } from '@/lib/db';

export const getAnalytics = async () => {
    // 1. Lead Source Distribution
    const sources = await query(`
        SELECT source, COUNT(*) as count 
        FROM leads 
        GROUP BY source 
        ORDER BY count DESC
    `);

    // 2. Conversion Funnel (Leads -> Qualified -> Won)
    const funnel = await query(`
        SELECT 
            COUNT(*) as total_leads,
            SUM(CASE WHEN status IN ('qualified', 'proposal', 'negotiation', 'won') THEN 1 ELSE 0 END) as qualified,
            SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won
        FROM leads
    `);

    // 3. User Performance
    const userPerformance = await query(`
        SELECT u.name, COUNT(d.id) as closed_deals, SUM(d.amount) as revenue
        FROM users u
        LEFT JOIN deals d ON u.id = d.created_by AND d.stage = 'closed_won'
        GROUP BY u.name
        HAVING COUNT(d.id) > 0 OR SUM(d.amount) > 0
        ORDER BY revenue DESC
    `);

    // 4. Monthly Revenue Trend
    const revenueTrend = await query(`
        SELECT TO_CHAR(created_at, 'Mon') as month, SUM(amount) as total 
        FROM deals 
        WHERE stage = 'closed_won'
        GROUP BY month, date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
    `);

    return {
        sources: sources.rows,
        funnel: funnel.rows[0],
        performance: userPerformance.rows,
        revenueTrend: revenueTrend.rows
    };
};
