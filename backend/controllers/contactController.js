import { pool } from '../config/database.js';
import { logAction } from './auditController.js';

// Get all contacts
export const getAllContacts = async (req, res) => {
  try {
    const { status, source, search } = req.query;
    let query = `
      SELECT c.*, u.name as assigned_to_name 
      FROM contacts c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      WHERE c.is_deleted = false
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (source) {
      query += ` AND c.source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }

    if (search) {
      query += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount + 1} OR c.email ILIKE $${paramCount + 2} OR c.company ILIKE $${paramCount + 3})`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      paramCount += 4;
    }

    query += ' ORDER BY c.created_at DESC';

    const contacts = await pool.query(query, params);
    res.json({ contacts: contacts.rows });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get deleted contacts (Recycle Bin)
export const getDeletedContacts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, updated_at FROM contacts WHERE is_deleted = true ORDER BY updated_at DESC'
    );
    res.json({ contacts: result.rows });
  } catch (error) {
    console.error('Get deleted contacts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Restore a contact
export const restoreContact = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE contacts SET is_deleted = false WHERE id = $1', [id]);
    await logAction('contacts', id, 'restore', req.user.id, { message: 'Contact restored' });
    res.json({ message: 'Contact restored successfully' });
  } catch (error) {
    console.error('Restore contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single contact
export const getContactById = async (req, res) => {
  try {
    const contacts = await pool.query(
      `SELECT c.*, u.name as assigned_to_name, creator.name as created_by_name 
       FROM contacts c 
       LEFT JOIN users u ON c.assigned_to = u.id 
       LEFT JOIN users creator ON c.created_by = creator.id
       WHERE c.id = $1 AND c.is_deleted = false`,
      [req.params.id]
    );

    if (contacts.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ contact: contacts.rows[0] });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create contact
export const createContact = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, company, position,
      address, city, state, country, postal_code, source, status, assigned_to, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contacts (
        first_name, last_name, email, phone, company, position,
        address, city, state, country, postal_code, source, status, assigned_to, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        first_name, last_name, email, phone, company, position,
        address, city, state, country, postal_code, source, status || 'active',
        assigned_to, notes, req.user.id
      ]
    );

    const newContact = result.rows[0];
    await logAction('contacts', newContact.id, 'create', req.user.id, newContact);

    res.status(201).json({
      message: 'Contact created successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update contact
export const updateContact = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, company, position,
      address, city, state, country, postal_code, source, status, assigned_to, notes
    } = req.body;

    await pool.query(
      `UPDATE contacts SET 
        first_name = $1, last_name = $2, email = $3, phone = $4, company = $5, position = $6,
        address = $7, city = $8, state = $9, country = $10, postal_code = $11, source = $12,
        status = $13, assigned_to = $14, notes = $15
       WHERE id = $16 AND is_deleted = false`,
      [
        first_name, last_name, email, phone, company, position,
        address, city, state, country, postal_code, source, status, assigned_to, notes,
        req.params.id
      ]
    );

    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete contact (Soft Delete)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
      await logAction('contacts', id, 'permanent_delete', req.user.id, { message: 'Contact deleted permanently' });
      return res.json({ message: 'Contact deleted permanently' });
    }

    await pool.query('UPDATE contacts SET is_deleted = true WHERE id = $1', [id]);
    await logAction('contacts', id, 'delete', req.user.id, { message: 'Contact moved to recycle bin' });
    res.json({ message: 'Contact moved to recycle bin' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

