import { query } from '@/lib/db';

export const getAllDeals = async (filters) => {
    const { stage, search } = filters;
    let queryString = `
      SELECT d.*, c.first_name, c.last_name, u.name as assigned_to_name 
      FROM deals d 
      LEFT JOIN contacts c ON d.contact_id = c.id 
      LEFT JOIN users u ON d.assigned_to = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (stage) {
        queryString += ` AND d.stage = $${paramCount}`;
        params.push(stage);
        paramCount++;
    }

    if (search) {
        queryString += ` AND (d.name ILIKE $${paramCount} OR c.first_name ILIKE $${paramCount + 1} OR c.last_name ILIKE $${paramCount + 2})`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
        paramCount += 3;
    }

    queryString += ' ORDER BY d.created_at DESC';

    const deals = await query(queryString, params);
    return { deals: deals.rows };
};

export const getDealById = async (id) => {
    const deals = await query(
        `SELECT d.*, c.first_name, c.last_name, u.name as assigned_to_name, creator.name as created_by_name 
       FROM deals d 
       LEFT JOIN contacts c ON d.contact_id = c.id 
       LEFT JOIN users u ON d.assigned_to = u.id 
       LEFT JOIN users creator ON d.created_by = creator.id
       WHERE d.id = $1`,
        [id]
    );

    if (deals.rows.length === 0) {
        throw new Error('Deal not found');
    }

    return { deal: deals.rows[0] };
};

export const createDeal = async (data, userId) => {
    const {
        name, amount, currency, stage, probability, expected_close_date, contact_id, lead_id, assigned_to, notes
    } = data;

    const result = await query(
        `INSERT INTO deals (
        name, amount, currency, stage, probability, expected_close_date, contact_id, lead_id, assigned_to, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
            name, amount, currency || 'USD', stage || 'prospecting', probability || 50, expected_close_date, contact_id, lead_id, assigned_to, notes, userId
        ]
    );

    return {
        message: 'Deal created successfully',
        deal: result.rows[0]
    };
};

export const updateDeal = async (id, data) => {
    const {
        name, amount, currency, stage, probability, expected_close_date, actual_close_date, contact_id, lead_id, assigned_to, notes
    } = data;

    await query(
        `UPDATE deals SET 
        name = $1, amount = $2, currency = $3, stage = $4, probability = $5, expected_close_date = $6, actual_close_date = $7, contact_id = $8, lead_id = $9, assigned_to = $10, notes = $11
       WHERE id = $12`,
        [
            name, amount, currency, stage, probability, expected_close_date, actual_close_date, contact_id, lead_id, assigned_to, notes, id
        ]
    );

    return { message: 'Deal updated successfully' };
};

export const deleteDeal = async (id) => {
    await query('DELETE FROM deals WHERE id = $1', [id]);
    return { message: 'Deal deleted successfully' };
};
