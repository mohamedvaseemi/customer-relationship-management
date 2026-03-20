import { pool } from '../config/database.js';

// Get all workflow rules
export const getWorkflowRules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workflow_rules ORDER BY created_at DESC');
    res.json({ rules: result.rows });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a workflow rule
export const createWorkflowRule = async (req, res) => {
  const { name, module, trigger_event, conditions, actions } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO workflow_rules (name, module, trigger_event, conditions, actions)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, module, trigger_event, conditions, actions]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Toggle workflow status
export const toggleWorkflowRule = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE workflow_rules SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a workflow rule
export const deleteWorkflowRule = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM workflow_rules WHERE id = $1', [id]);
    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
