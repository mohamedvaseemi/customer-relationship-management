import { pool } from '../config/database.js';

// Get all automation templates
export const getTemplates = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM automation_templates ORDER BY created_at DESC');
        res.json({ templates: result.rows });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get tasks for a template
export const getTemplateTasks = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM automation_tasks WHERE template_id = $1 ORDER BY step_order ASC',
            [req.params.templateId]
        );
        res.json({ tasks: result.rows });
    } catch (error) {
        console.error('Get template tasks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Trigger automation (Simplified for demo/Phase 2)
export const triggerAutomation = async (req, res) => {
    try {
        const { lead_id, template_id } = req.body;

        // In a real Zoho-like system, this would be a background job
        // 1. Get tasks
        const tasks = await pool.query(
            'SELECT * FROM automation_tasks WHERE template_id = $1 ORDER BY step_order ASC',
            [template_id]
        );

        // 2. Create tasks/logs for each step (Mocking the execution logic)
        for (const task of tasks.rows) {
            if (task.action_type === 'create_task') {
                await pool.query(
                    `INSERT INTO activities (lead_id, user_id, type, subject, status, due_date)
                     VALUES ($1, $2, 'task', $3, 'todo', CURRENT_DATE + $4)`,
                    [lead_id, req.user.id, task.task_subject, task.delay_days]
                );
            }
        }

        res.json({ message: 'Automation sequence triggered successfully' });
    } catch (error) {
        console.error('Trigger automation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
