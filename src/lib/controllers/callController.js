import { query } from '@/lib/db';

export const getAllCalls = async () => {
    const result = await query(`
        SELECT cl.*, c.first_name, c.last_name, u.name as user_name
        FROM call_logs cl
        LEFT JOIN contacts c ON cl.contact_id = c.id
        LEFT JOIN users u ON cl.user_id = u.id
        ORDER BY cl.created_at DESC
    `);
    return { calls: result.rows };
};

export const createCall = async (data, userId) => {
    const { contact_id, lead_id, duration_seconds, outcome, notes } = data;
    const result = await query(
        `INSERT INTO call_logs (contact_id, lead_id, user_id, duration_seconds, outcome, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [contact_id, lead_id, userId, duration_seconds, outcome, notes]
    );
    return { message: 'Call logged successfully', call: result.rows[0] };
};
