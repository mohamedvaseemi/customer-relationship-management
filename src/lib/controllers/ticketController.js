import { query } from '@/lib/db';

export const getAllTickets = async (filters = {}) => {
    const { status, priority, search } = filters;
    let queryString = `
        SELECT t.*, c.first_name, c.last_name, c.email as contact_email, u.name as assigned_to_name
        FROM tickets t
        LEFT JOIN contacts c ON t.contact_id = c.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
        queryString += ` AND t.status = $${paramCount}`;
        params.push(status);
        paramCount++;
    }

    if (priority) {
        queryString += ` AND t.priority = $${paramCount}`;
        params.push(priority);
        paramCount++;
    }

    if (search) {
        queryString += ` AND (t.subject ILIKE $${paramCount} OR t.description ILIKE $${paramCount + 1})`;
        const s = `%${search}%`;
        params.push(s, s);
        paramCount += 2;
    }

    queryString += ' ORDER BY t.created_at DESC';

    const result = await query(queryString, params);
    return { tickets: result.rows };
};

export const getTicketById = async (id) => {
    const result = await query(
        `SELECT t.*, c.first_name, c.last_name, c.email as contact_email, u.name as assigned_to_name
         FROM tickets t
         LEFT JOIN contacts c ON t.contact_id = c.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.id = $1`,
        [id]
    );
    if (result.rows.length === 0) throw new Error('Ticket not found');
    return { ticket: result.rows[0] };
};

export const createTicket = async (data, userId) => {
    const { contact_id, subject, description, status, priority, category, assigned_to } = data;
    const result = await query(
        `INSERT INTO tickets (contact_id, subject, description, status, priority, category, assigned_to, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [contact_id, subject, description, status || 'open', priority || 'medium', category, assigned_to, userId]
    );
    return { message: 'Ticket created successfully', ticket: result.rows[0] };
};

export const updateTicket = async (id, data) => {
    const { subject, description, status, priority, category, assigned_to, resolved_at } = data;
    const result = await query(
        `UPDATE tickets SET subject=$1, description=$2, status=$3, priority=$4, category=$5,
         assigned_to=$6, resolved_at=$7, updated_at=NOW() WHERE id=$8 RETURNING *`,
        [subject, description, status, priority, category, assigned_to, resolved_at, id]
    );
    if (result.rows.length === 0) throw new Error('Ticket not found');
    return { message: 'Ticket updated successfully', ticket: result.rows[0] };
};

export const deleteTicket = async (id) => {
    await query('DELETE FROM tickets WHERE id = $1', [id]);
    return { message: 'Ticket deleted successfully' };
};
