import { pool } from '../config/database.js';

// Get all deals
export const getAllDeals = async (req, res) => {
  try {
    const { stage, search } = req.query;
    let query = `
      SELECT d.*, c.first_name, c.last_name, u.name as assigned_to_name 
      FROM deals d 
      LEFT JOIN contacts c ON d.contact_id = c.id 
      LEFT JOIN users u ON d.assigned_to = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (stage) {
      query += ` AND d.stage = $${paramCount}`;
      params.push(stage);
      paramCount++;
    }

    if (search) {
      query += ` AND (d.name ILIKE $${paramCount} OR c.first_name ILIKE $${paramCount + 1} OR c.last_name ILIKE $${paramCount + 2})`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      paramCount += 3;
    }

    query += ' ORDER BY d.created_at DESC';

    const deals = await pool.query(query, params);
    res.json({ deals: deals.rows });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single deal
export const getDealById = async (req, res) => {
  try {
    const deals = await pool.query(
      `SELECT d.*, c.first_name, c.last_name, u.name as assigned_to_name, creator.name as created_by_name 
       FROM deals d 
       LEFT JOIN contacts c ON d.contact_id = c.id 
       LEFT JOIN users u ON d.assigned_to = u.id 
       LEFT JOIN users creator ON d.created_by = creator.id
       WHERE d.id = $1`,
      [req.params.id]
    );

    if (deals.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ deal: deals.rows[0] });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create deal
export const createDeal = async (req, res) => {
  try {
    const {
      name, amount, currency, stage, probability, expected_close_date, contact_id, lead_id, assigned_to, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO deals (
        name, amount, currency, stage, probability, expected_close_date, contact_id, lead_id, assigned_to, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        name, amount, currency || 'USD', stage || 'prospecting', probability || 50, expected_close_date, contact_id, lead_id, assigned_to, notes, req.user.id
      ]
    );

    res.status(201).json({
      message: 'Deal created successfully',
      deal: result.rows[0]
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update deal
export const updateDeal = async (req, res) => {
  try {
    const {
      name, amount, currency, stage, probability, expected_close_date, actual_close_date, contact_id, lead_id, assigned_to, notes
    } = req.body;

    await pool.query(
      `UPDATE deals SET 
        name = $1, amount = $2, currency = $3, stage = $4, probability = $5, expected_close_date = $6, actual_close_date = $7, contact_id = $8, lead_id = $9, assigned_to = $10, notes = $11
       WHERE id = $12`,
      [
        name, amount, currency, stage, probability, expected_close_date, actual_close_date, contact_id, lead_id, assigned_to, notes, req.params.id
      ]
    );

    res.json({ message: 'Deal updated successfully' });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete deal
export const deleteDeal = async (req, res) => {
  try {
    await pool.query('DELETE FROM deals WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

