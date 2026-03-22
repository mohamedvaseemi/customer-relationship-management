import { query } from '@/lib/db';

export const getAllActivities = async (filters = {}) => {
    const { status, priority, type } = filters;
    let queryString = `
        SELECT a.*, l.title as lead_name, c.first_name, c.last_name, u.name as assigned_to_name
        FROM activities a
        LEFT JOIN leads l ON a.lead_id = l.id
        LEFT JOIN contacts c ON a.contact_id = c.id
        LEFT JOIN users u ON a.assigned_to = u.id
        WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
        queryString += ` AND a.status = $${paramCount}`;
        params.push(status);
        paramCount++;
    }

    if (type) {
        queryString += ` AND a.activity_type = $${paramCount}`;
        params.push(type);
        paramCount++;
    }

    queryString += ' ORDER BY a.due_date ASC';

    const result = await query(queryString, params);
    return { activities: result.rows };
};

export const createActivity = async (data, userId) => {
    const { lead_id, contact_id, subject, description, activity_type, due_date, status, priority, assigned_to } = data;
    const result = await query(
        `INSERT INTO activities (lead_id, contact_id, subject, description, activity_type, due_date, status, priority, assigned_to, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [lead_id, contact_id, subject, description, activity_type || 'task', due_date, status || 'pending', priority || 'medium', assigned_to, userId]
    );
    return { message: 'Activity created', activity: result.rows[0] };
};

export const updateActivity = async (id, data) => {
    const { subject, description, status, priority, due_date, assigned_to } = data;
    const result = await query(
        `UPDATE activities SET subject=$1, description=$2, status=$3, priority=$4, due_date=$5, assigned_to=$6
         WHERE id=$7 RETURNING *`,
        [subject, description, status, priority, due_date, assigned_to, id]
    );
    return { message: 'Activity updated', activity: result.rows[0] };
};

export const deleteActivity = async (id) => {
    await query('DELETE FROM activities WHERE id=$1', [id]);
    return { message: 'Activity deleted' };
};
