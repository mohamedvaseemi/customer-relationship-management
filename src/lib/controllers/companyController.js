import { query } from '@/lib/db';

export const getAllCompanies = async (filters = {}) => {
    const { search, industry } = filters;
    let queryString = `SELECT * FROM companies WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (search) {
        queryString += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount + 1} OR website ILIKE $${paramCount + 2})`;
        const s = `%${search}%`;
        params.push(s, s, s);
        paramCount += 3;
    }

    if (industry) {
        queryString += ` AND industry = $${paramCount}`;
        params.push(industry);
        paramCount++;
    }

    queryString += ' ORDER BY created_at DESC';

    const result = await query(queryString, params);
    return { companies: result.rows };
};

export const getCompanyById = async (id) => {
    const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new Error('Company not found');
    return { company: result.rows[0] };
};

export const createCompany = async (data, userId) => {
    const { name, website, email, phone, industry, address, city, state, country, notes } = data;
    const result = await query(
        `INSERT INTO companies (name, website, email, phone, industry, address, city, state, country, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [name, website, email, phone, industry, address, city, state, country, notes, userId]
    );
    return { message: 'Company created successfully', company: result.rows[0] };
};

export const updateCompany = async (id, data) => {
    const { name, website, email, phone, industry, address, city, state, country, notes } = data;
    const result = await query(
        `UPDATE companies SET name=$1, website=$2, email=$3, phone=$4, industry=$5,
         address=$6, city=$7, state=$8, country=$9, notes=$10 WHERE id=$11 RETURNING *`,
        [name, website, email, phone, industry, address, city, state, country, notes, id]
    );
    if (result.rows.length === 0) throw new Error('Company not found');
    return { message: 'Company updated successfully', company: result.rows[0] };
};

export const deleteCompany = async (id) => {
    await query('DELETE FROM companies WHERE id = $1', [id]);
    return { message: 'Company deleted successfully' };
};
