import { query } from '@/lib/db';

// Campaigns
export const getAllCampaigns = async () => {
    const result = await query('SELECT * FROM campaigns ORDER BY created_at DESC');
    return { campaigns: result.rows };
};

export const createCampaign = async (data, userId) => {
    const { name, type, status, start_date, end_date, budget, description } = data;
    const result = await query(
        `INSERT INTO campaigns (name, type, status, start_date, end_date, budget, description, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, type || 'email', status || 'planning', start_date, end_date, budget, description, userId]
    );
    return { message: 'Campaign created', campaign: result.rows[0] };
};

export const deleteCampaign = async (id) => {
    await query('DELETE FROM campaigns WHERE id = $1', [id]);
    return { message: 'Campaign deleted' };
};

// Documents
export const getAllDocuments = async () => {
    const result = await query(`
        SELECT d.*, l.title as lead_name, u.name as created_by_name
        FROM documents d
        LEFT JOIN leads l ON d.lead_id = l.id
        LEFT JOIN users u ON d.created_by = u.id
        ORDER BY d.created_at DESC
    `);
    return { documents: result.rows };
};

export const createDocument = async (data, userId) => {
    const { name, file_path, file_type, file_size, category, lead_id, deal_id } = data;
    const result = await query(
        `INSERT INTO documents (name, file_path, file_type, file_size, category, lead_id, deal_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, file_path, file_type, file_size, category || 'general', lead_id, deal_id, userId]
    );
    return { message: 'Document uploaded', document: result.rows[0] };
};

export const deleteDocument = async (id) => {
    await query('DELETE FROM documents WHERE id = $1', [id]);
    return { message: 'Document deleted' };
};
