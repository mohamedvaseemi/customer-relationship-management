import { pool } from '../config/database.js';

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const { industry, search } = req.query;
    let query = `
      SELECT c.*, u.name as created_by_name 
      FROM companies c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (industry) {
      query += ` AND c.industry = $${paramCount}`;
      params.push(industry);
      paramCount++;
    }

    if (search) {
      query += ` AND (c.name ILIKE $${paramCount} OR c.website ILIKE $${paramCount + 1} OR c.city ILIKE $${paramCount + 2})`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      paramCount += 3;
    }

    query += ' ORDER BY c.created_at DESC';

    const companies = await pool.query(query, params);
    res.json({ companies: companies.rows });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single company
export const getCompanyById = async (req, res) => {
  try {
    const companies = await pool.query(
      `SELECT c.*, creator.name as created_by_name 
       FROM companies c 
       LEFT JOIN users creator ON c.created_by = creator.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (companies.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company: companies.rows[0] });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create company
export const createCompany = async (req, res) => {
  try {
    const {
      name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (
        name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes, req.user.id
      ]
    );

    res.status(201).json({
      message: 'Company created successfully',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const {
      name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes
    } = req.body;

    await pool.query(
      `UPDATE companies SET 
        name = $1, industry = $2, website = $3, phone = $4, email = $5, address = $6, city = $7, state = $8, country = $9, postal_code = $10, employee_count = $11, annual_revenue = $12, notes = $13
       WHERE id = $14`,
      [
        name, industry, website, phone, email, address, city, state, country, postal_code, employee_count, annual_revenue, notes, req.params.id
      ]
    );

    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
