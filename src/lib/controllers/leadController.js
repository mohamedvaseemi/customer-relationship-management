import { query } from '@/lib/db';

export const getAllLeads = async (filters) => {
    const { status, priority, source } = filters;
    let queryString = `
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
        queryString += ` AND l.status = $${paramCount}`;
        params.push(status);
        paramCount++;
    }

    if (priority) {
        queryString += ` AND l.priority = $${paramCount}`;
        params.push(priority);
        paramCount++;
    }

    if (source) {
        queryString += ` AND l.source = $${paramCount}`;
        params.push(source);
        paramCount++;
    }

    if (filters.search) {
        queryString += ` AND (l.title ILIKE $${paramCount} OR c.email ILIKE $${paramCount + 1} OR c.company ILIKE $${paramCount + 2})`;
        const s = `%${filters.search}%`;
        params.push(s, s, s);
        paramCount += 3;
    }

    queryString += ' ORDER BY l.created_at DESC';

    const leads = await query(queryString, params);
    return { leads: leads.rows };
};

export const getLeadById = async (id) => {
    const leads = await query(
        `SELECT l.*, c.first_name, c.last_name, c.email, c.company, c.phone,
              u.name as assigned_to_name
       FROM leads l
       LEFT JOIN contacts c ON l.contact_id = c.id
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = $1`,
        [id]
    );

    if (leads.rows.length === 0) {
        throw new Error('Lead not found');
    }

    return { lead: leads.rows[0] };
};

export const createLead = async (data, userId) => {
    const {
        contact_id, title, value, currency, status, priority, source,
        expected_close_date, probability, assigned_to, notes
    } = data;

    const result = await query(
        `INSERT INTO leads (
        contact_id, title, value, currency, status, priority, source,
        expected_close_date, probability, assigned_to, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
            contact_id, title, value, currency || 'USD', status || 'new',
            priority || 'medium', source, expected_close_date, probability || 50,
            assigned_to, notes, userId
        ]
    );

    return {
        message: 'Lead created successfully',
        lead: result.rows[0]
    };
};

export const updateLead = async (id, data) => {
    const {
        contact_id, title, value, currency, status, priority, source,
        expected_close_date, probability, assigned_to, notes
    } = data;

    await query(
        `UPDATE leads SET 
        contact_id = $1, title = $2, value = $3, currency = $4, status = $5,
        priority = $6, source = $7, expected_close_date = $8, probability = $9,
        assigned_to = $10, notes = $11
       WHERE id = $12`,
        [
            contact_id, title, value, currency, status, priority, source,
            expected_close_date, probability, assigned_to, notes, id
        ]
    );

    return { message: 'Lead updated successfully' };
};

export const deleteLead = async (id) => {
    await query('DELETE FROM leads WHERE id = $1', [id]);
    return { message: 'Lead deleted successfully' };
};

export const getLeadStats = async () => {
    const stats = await query(`
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

    return { stats: stats.rows[0] };
};
