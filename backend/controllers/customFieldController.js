import { pool } from '../config/database.js';

// Get all custom fields for a module
export const getCustomFields = async (req, res) => {
  const { module } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM custom_fields WHERE module_name = $1 AND is_active = true ORDER BY created_at ASC',
      [module]
    );
    res.json({ fields: result.rows });
  } catch (error) {
    console.error('Get custom fields error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new custom field
export const createCustomField = async (req, res) => {
  const { module_name, field_label, field_name, data_type, options, is_mandatory } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO custom_fields (module_name, field_label, field_name, data_type, options, is_mandatory)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [module_name, field_label, field_name, data_type, options, is_mandatory]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Field name already exists for this module' });
    }
    console.error('Create custom field error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Toggle field status
export const updateCustomField = async (req, res) => {
  const { id } = req.params;
  const { is_active, field_label, is_mandatory } = req.body;
  try {
    const result = await pool.query(
      `UPDATE custom_fields 
       SET is_active = COALESCE($1, is_active), 
           field_label = COALESCE($2, field_label),
           is_mandatory = COALESCE($3, is_mandatory)
       WHERE id = $4 RETURNING *`,
      [is_active, field_label, is_mandatory, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update custom field error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a custom field
export const deleteCustomField = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM custom_fields WHERE id = $1', [id]);
    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Delete custom field error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
