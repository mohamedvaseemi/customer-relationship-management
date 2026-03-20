import { pool } from '../config/database.js';

// Get all leads
export const getAllLeads = async (req, res) => {
    try {
        const { status, priority, source } = req.query;
        let query = `
      SELECT l.*, c.first_name, c.last_name, c.email, c.company,
             u.name as assigned_to_name
      FROM leads l
      LEFT JOIN contacts c ON l.contact_id = c.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;

        if (status) {
            query += ` AND l.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (priority) {
            query += ` AND l.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        if (source) {
            query += ` AND l.source = $${paramCount}`;
            params.push(source);
            paramCount++;
        }

        query += ' ORDER BY l.created_at DESC';

        const leads = await pool.query(query, params);
        res.json({ leads: leads.rows });
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single lead
export const getLeadById = async (req, res) => {
    try {
        const leads = await pool.query(
            `SELECT l.*, c.first_name, c.last_name, c.email, c.company, c.phone,
              u.name as assigned_to_name
       FROM leads l
       LEFT JOIN contacts c ON l.contact_id = c.id
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = $1`,
            [req.params.id]
        );

        if (leads.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json({ lead: leads.rows[0] });
    } catch (error) {
        console.error('Get lead error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create lead
export const createLead = async (req, res) => {
    try {
        const {
            contact_id, title, value, currency, status, priority, source,
            expected_close_date, probability, assigned_to, notes
        } = req.body;

        const result = await pool.query(
            `INSERT INTO leads (
        contact_id, title, value, currency, status, priority, source,
        expected_close_date, probability, assigned_to, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                contact_id, title, value, currency || 'USD', status || 'new',
                priority || 'medium', source, expected_close_date, probability || 50,
                assigned_to, notes, req.user.id
            ]
        );

        res.status(201).json({
            message: 'Lead created successfully',
            lead: result.rows[0]
        });
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update lead
export const updateLead = async (req, res) => {
    try {
        const {
            contact_id, title, value, currency, status, priority, source,
            expected_close_date, probability, assigned_to, notes
        } = req.body;

        await pool.query(
            `UPDATE leads SET 
        contact_id = $1, title = $2, value = $3, currency = $4, status = $5,
        priority = $6, source = $7, expected_close_date = $8, probability = $9,
        assigned_to = $10, notes = $11
       WHERE id = $12`,
            [
                contact_id, title, value, currency, status, priority, source,
                expected_close_date, probability, assigned_to, notes, req.params.id
            ]
        );

        res.json({ message: 'Lead updated successfully' });
    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete lead
export const deleteLead = async (req, res) => {
    try {
        await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get lead statistics
export const getLeadStats = async (req, res) => {
    try {
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

        res.json({ stats: stats.rows[0] });
    } catch (error) {
        console.error('Get lead stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
