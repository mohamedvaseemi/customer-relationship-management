import { query } from '@/lib/db';

export const getAllAutomations = async (userId) => {
    const result = await query(
        `SELECT a.*, (SELECT COUNT(*) FROM automation_tasks t WHERE t.template_id = a.id) as task_count
         FROM automation_templates a
         ORDER BY a.created_at DESC`
    );
    return { templates: result.rows };
};

export const createAutomation = async (data, userId) => {
    const { name, trigger_event, description, tasks } = data;
    const result = await query(
        `INSERT INTO automation_templates (name, trigger_event, description, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, trigger_event, description, userId]
    );
    const template = result.rows[0];

    // Bulk insert tasks if any
    if (tasks && Array.isArray(tasks)) {
        for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            await query(
                `INSERT INTO automation_tasks (template_id, step_order, action_type, delay_days, task_subject)
                 VALUES ($1, $2, $3, $4, $5)`,
                [template.id, i + 1, t.action_type, t.delay_days || 0, t.task_subject]
            );
        }
    }
    return { message: 'Automation created', template };
};

export const deleteAutomation = async (id) => {
    await query('DELETE FROM automation_templates WHERE id = $1', [id]);
    return { message: 'Automation deleted' };
};
