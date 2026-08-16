import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: List all active contacts
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const companyId = decoded.company_id || null;
        const userId = decoded.id;

        const { searchParams } = req.nextUrl;
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        let queryStr = `
            SELECT c.*, u.name as assigned_to_name
            FROM contacts c
            LEFT JOIN users u ON c.assigned_to = u.id
            LEFT JOIN users creator ON c.created_by = creator.id
            WHERE c.is_deleted = FALSE
              AND ($1::int IS NULL OR creator.company_id = $1::int OR u.company_id = $1::int OR c.created_by = $2::int)
        `;
        const params = [companyId, userId];
        let paramCount = 3;

        if (status) {
            queryStr += ` AND c.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (search) {
            queryStr += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.company ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        queryStr += ' ORDER BY c.created_at DESC';

        const result = await pool.query(queryStr, params);
        return NextResponse.json({ contacts: result.rows });
    } catch (error) {
        console.error('Get contacts error:', error);
        return NextResponse.json({ error: 'Server error', contacts: [] }, { status: 500 });
    }
}

// POST: Create new contact
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const {
            first_name, last_name, email, phone, company, position,
            address, city, state, country, postal_code, source, status, assigned_to, notes
        } = body;

        if (!first_name) {
            return NextResponse.json({ error: 'First name is required' }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO contacts (
                first_name, last_name, email, phone, company, position,
                address, city, state, country, postal_code, source, status,
                assigned_to, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                first_name, last_name || null, email || null, phone || null,
                company || null, position || null, address || null, city || null,
                state || null, country || null, postal_code || null, source || 'Direct',
                status || 'active', assigned_to || decoded.id, notes || null, decoded.id
            ]
        );

        return NextResponse.json({
            message: 'Contact created successfully',
            contact: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create contact error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}