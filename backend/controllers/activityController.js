import { pool } from '../config/database.js';

// Get all activities
export const getAllActivities = async (req, res) => {
    try {
        const { type, status, contact_id, lead_id } = req.query;
        let query = `
      SELECT a.*, c.first_name, c.last_name, c.email,
             u.name as assigned_to_name
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;

        if (type) {
            query += ` AND a.type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        if (status) {
            query += ` AND a.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (contact_id) {
            query += ` AND a.contact_id = $${paramCount}`;
            params.push(contact_id);
            paramCount++;
        }

        if (lead_id) {
            query += ` AND a.lead_id = $${paramCount}`;
            params.push(lead_id);
            paramCount++;
        }

        query += ' ORDER BY a.due_date DESC, a.created_at DESC';

        const activities = await pool.query(query, params);
        res.json({ activities: activities.rows });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single activity
export const getActivityById = async (req, res) => {
    try {
        const activities = await pool.query(
            `SELECT a.*, c.first_name, c.last_name, c.email,
              u.name as assigned_to_name
       FROM activities a
       LEFT JOIN contacts c ON a.contact_id = c.id
       LEFT JOIN users u ON a.assigned_to = u.id
       WHERE a.id = $1`,
            [req.params.id]
        );

        if (activities.rows.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ activity: activities.rows[0] });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create activity
export const createActivity = async (req, res) => {
    try {
        const {
            type, subject, description, contact_id, lead_id, assigned_to,
            status, priority, due_date
        } = req.body;

        const result = await pool.query(
            `INSERT INTO activities (
        type, subject, description, contact_id, lead_id, assigned_to,
        status, priority, due_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                type, subject, description, contact_id, lead_id, assigned_to,
                status || 'pending', priority || 'medium', due_date, req.user.id
            ]
        );

        res.status(201).json({
            message: 'Activity created successfully',
            activity: result.rows[0]
        });
    } catch (error) {
        console.error('Create activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update activity
export const updateActivity = async (req, res) => {
    try {
        const {
            type, subject, description, contact_id, lead_id, assigned_to,
            status, priority, due_date, completed_at
        } = req.body;

        await pool.query(
            `UPDATE activities SET 
        type = $1, subject = $2, description = $3, contact_id = $4, lead_id = $5,
        assigned_to = $6, status = $7, priority = $8, due_date = $9, completed_at = $10
       WHERE id = $11`,
            [
                type, subject, description, contact_id, lead_id, assigned_to,
                status, priority, due_date, completed_at, req.params.id
            ]
        );

        res.json({ message: 'Activity updated successfully' });
    } catch (error) {
        console.error('Update activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete activity
export const deleteActivity = async (req, res) => {
    try {
        await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Delete activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
