import { query } from '@/lib/db';

export const getAllContacts = async (filters) => {
    const { status, source, search } = filters;
    let queryString = `
      SELECT c.*, u.name as assigned_to_name 
      FROM contacts c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      WHERE c.is_deleted = false
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
        queryString += ` AND c.status = $${paramCount}`;
        params.push(status);
        paramCount++;
    }

    if (source) {
        queryString += ` AND c.source = $${paramCount}`;
        params.push(source);
        paramCount++;
    }

    if (search) {
        queryString += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount + 1} OR c.email ILIKE $${paramCount + 2} OR c.company ILIKE $${paramCount + 3})`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        paramCount += 4;
    }

    queryString += ' ORDER BY c.created_at DESC';

    const contacts = await query(queryString, params);
    return { contacts: contacts.rows };
};

export const getContactById = async (id) => {
    const contacts = await query(
        `SELECT c.*, u.name as assigned_to_name, creator.name as created_by_name 
       FROM contacts c 
       LEFT JOIN users u ON c.assigned_to = u.id 
       LEFT JOIN users creator ON c.created_by = creator.id
       WHERE c.id = $1 AND c.is_deleted = false`,
        [id]
    );

    if (contacts.rows.length === 0) {
        throw new Error('Contact not found');
    }

    return { contact: contacts.rows[0] };
};

export const createContact = async (data, userId) => {
    const {
        first_name, last_name, email, phone, company, position,
        address, city, state, country, postal_code, source, status, assigned_to, notes
    } = data;

    const result = await query(
        `INSERT INTO contacts (
        first_name, last_name, email, phone, company, position,
        address, city, state, country, postal_code, source, status, assigned_to, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
        [
            first_name, last_name, email, phone, company, position,
            address, city, state, country, postal_code, source, status || 'active',
            assigned_to, notes, userId
        ]
    );

    return {
        message: 'Contact created successfully',
        contact: result.rows[0]
    };
};

export const updateContact = async (id, data) => {
    const {
        first_name, last_name, email, phone, company, position,
        address, city, state, country, postal_code, source, status, assigned_to, notes
    } = data;

    await query(
        `UPDATE contacts SET 
        first_name = $1, last_name = $2, email = $3, phone = $4, company = $5, position = $6,
        address = $7, city = $8, state = $9, country = $10, postal_code = $11, source = $12,
        status = $13, assigned_to = $14, notes = $15
       WHERE id = $16 AND is_deleted = false`,
        [
            first_name, last_name, email, phone, company, position,
            address, city, state, country, postal_code, source, status, assigned_to, notes,
            id
        ]
    );

    return { message: 'Contact updated successfully' };
};

export const deleteContact = async (id, permanent) => {
    if (permanent === 'true') {
        await query('DELETE FROM contacts WHERE id = $1', [id]);
        return { message: 'Contact deleted permanently' };
    }

    await query('UPDATE contacts SET is_deleted = true WHERE id = $1', [id]);
    return { message: 'Contact moved to recycle bin' };
};
