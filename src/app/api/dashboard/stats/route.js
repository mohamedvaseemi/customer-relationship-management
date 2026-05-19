import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        // Total contacts
        let contacts = {};
        try {
            const res = await pool.query(`
                SELECT COUNT(*) as total_contacts,
                       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contacts
                FROM contacts
            `);
            contacts = res.rows[0];
        } catch (e) { console.warn('Dashboard: contacts missing', e.message); }

        // Lead statistics
        let leads = {};
        try {
            const res = await pool.query(`
                SELECT 
                    COUNT(*) as total_leads,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
                    SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
                    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_leads,
                    COALESCE(SUM(value), 0) as total_pipeline_value
                FROM leads
            `);
            leads = res.rows[0];
        } catch (e) { console.warn('Dashboard: leads missing', e.message); }

        // Deal statistics
        let deals = {};
        try {
            const res = await pool.query(`
                SELECT 
                    COUNT(*) as total_deals,
                    COALESCE(SUM(CASE WHEN stage = 'closed_won' THEN amount ELSE 0 END), 0) as won_amount,
                    COALESCE(SUM(CASE WHEN stage != 'closed_won' AND stage != 'closed_lost' THEN amount ELSE 0 END), 0) as pending_amount
                FROM deals
            `);
            deals = res.rows[0];
        } catch (e) { console.warn('Dashboard: deals missing', e.message); }

        // Activity statistics
        let activities = {};
        try {
            const res = await pool.query(`
                SELECT 
                    COUNT(*) as total_activities,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_activities,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_activities
                FROM activities
            `);
            activities = res.rows[0];
        } catch (e) { console.warn('Dashboard: activities missing', e.message); }

        // Recent activities
        let recentRows = [];
        try {
            const res = await pool.query(`
                SELECT a.*, c.first_name, c.last_name, u.name as assigned_to_name
                FROM activities a
                LEFT JOIN contacts c ON a.contact_id = c.id
                LEFT JOIN users u ON a.assigned_to = u.id
                ORDER BY a.created_at DESC
                LIMIT 10
            `);
            recentRows = res.rows;
        } catch (e) { console.warn('Dashboard: recent activities missing', e.message); }

        // Monthly Lead statistics
        let leadsTrend = [];
        try {
            const res = await pool.query(`
                SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count
                FROM leads
                WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at)
            `);
            leadsTrend = res.rows;
        } catch (e) { console.warn('Dashboard: leads trend missing', e.message); }

        // Monthly Revenue trend
        let revenueTrend = [];
        try {
            const res = await pool.query(`
                SELECT TO_CHAR(created_at, 'Mon') as month, COALESCE(SUM(amount), 0) as total
                FROM deals
                WHERE stage = 'closed_won' AND created_at >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at)
            `);
            revenueTrend = res.rows;
        } catch (e) { console.warn('Dashboard: revenue trend missing', e.message); }

        // Leads by status
        let statusSummary = [];
        try {
            const res = await pool.query(`
                SELECT status, COUNT(*) as count
                FROM leads
                GROUP BY status
            `);
            statusSummary = res.rows;
        } catch (e) { console.warn('Dashboard: leads by status missing', e.message); }

        // Ticket statistics
        let tickets = {};
        try {
            const res = await pool.query(`
                SELECT 
                    COUNT(*) as total_tickets,
                    SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets
                FROM tickets
            `);
            tickets = res.rows[0];
        } catch (e) { console.warn('Dashboard: tickets missing', e.message); }

        // Lead Status breakdown (fallback statusSummary)
        let leadsByStatus = [];
        try {
            const res = await pool.query(`
                SELECT status, COUNT(*) as count
                FROM leads
                GROUP BY status
            `);
            leadsByStatus = res.rows;
        } catch (e) { console.warn('Dashboard: status breakdown missing', e.message); }

        // My Open Tasks
        let openTasks = [];
        try {
            const res = await pool.query(`
                SELECT * FROM activities 
                WHERE type = 'task' AND status = 'pending'
                ORDER BY due_date ASC
                LIMIT 5
            `);
            openTasks = res.rows;
        } catch (e) { console.warn('Dashboard: open tasks missing', e.message); }

        // My Meetings
        let upcomingMeetings = [];
        try {
            const res = await pool.query(`
                SELECT * FROM activities 
                WHERE type = 'meeting' AND status = 'pending' AND due_date >= CURRENT_TIMESTAMP
                ORDER BY due_date ASC
                LIMIT 5
            `);
            upcomingMeetings = res.rows;
        } catch (e) { console.warn('Dashboard: meetings missing', e.message); }

        return NextResponse.json({
            stats: {
                contacts: contacts || {},
                leads: leads || {},
                deals: deals || {},
                activities: activities || {},
                tickets: tickets || {}
            },
            openTasks: openTasks || [],
            upcomingMeetings: upcomingMeetings || [],
            recentActivities: recentRows || [],
            leadsByStatus: leadsByStatus || statusSummary || [],
            trends: {
                leads: leadsTrend || [],
                revenue: revenueTrend || []
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
