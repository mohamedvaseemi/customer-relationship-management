import { pool } from '../config/database.js';

// Get activity logs for a lead (Timeline)
export const getLeadTimeline = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT lal.*, u.name as user_name
             FROM lead_activity_logs lal
             LEFT JOIN users u ON lal.user_id = u.id
             WHERE lal.lead_id = $1
             ORDER BY lal.created_at DESC`,
            [req.params.leadId]
        );
        res.json({ timeline: result.rows });
    } catch (error) {
        console.error('Get timeline error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Log an activity manually
export const logActivity = async (req, res) => {
    try {
        const { lead_id, action, old_value, new_value } = req.body;
        const result = await pool.query(
            `INSERT INTO lead_activity_logs (lead_id, user_id, action, old_value, new_value)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [lead_id, req.user.id, action, old_value, new_value]
        );
        res.status(201).json({ log: result.rows[0] });
    } catch (error) {
        console.error('Log activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
