import { pool } from '../config/database.js';

// Get all tickets
export const getAllTickets = async (req, res) => {
    try {
        const { status, priority } = req.query;
        let query = `
            SELECT t.*, c.first_name, c.last_name, 
                   u.name as assigned_to_name
            FROM tickets t
            LEFT JOIN contacts c ON t.contact_id = c.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            query += ` AND t.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (priority) {
            query += ` AND t.priority = $${paramCount}`;
            params.push(priority);
            paramCount++;
        }

        query += ' ORDER BY t.created_at DESC';

        const tickets = await pool.query(query, params);
        res.json({ tickets: tickets.rows });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create ticket
export const createTicket = async (req, res) => {
    try {
        const { subject, description, priority, contact_id, assigned_to } = req.body;
        const result = await pool.query(
            `INSERT INTO tickets (subject, description, priority, contact_id, assigned_to, created_by)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [subject, description, priority || 'medium', contact_id, assigned_to, req.user.id]
        );
        res.status(201).json({ message: 'Ticket created', ticket: result.rows[0] });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update ticket status/priority
export const updateTicket = async (req, res) => {
    try {
        const { status, priority, assigned_to } = req.body;
        await pool.query(
            `UPDATE tickets SET status = COALESCE($1, status), 
                               priority = COALESCE($2, priority),
                               assigned_to = COALESCE($3, assigned_to),
                               updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [status, priority, assigned_to, req.params.id]
        );
        res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
