import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// GET all contacts
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const status = searchParams.get('status');
        const source = searchParams.get('source');
        const search = searchParams.get('search');

        let queryStr = `
            SELECT c.*, u.name as assigned_to_name 
            FROM contacts c 
            LEFT JOIN users u ON c.assigned_to = u.id 
            WHERE c.is_deleted = false
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            queryStr += ` AND c.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (source) {
            queryStr += ` AND c.source = $${paramCount}`;
            params.push(source);
            paramCount++;
        }

        if (search) {
            queryStr += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount + 1} OR c.email ILIKE $${paramCount + 2} OR c.company ILIKE $${paramCount + 3})`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
            paramCount += 4;
        }

        queryStr += ' ORDER BY c.created_at DESC';

        const contacts = await pool.query(queryStr, params);
        return NextResponse.json({ contacts: contacts.rows });
    } catch (error) {
        console.error('Get contacts error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create contact
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

        const result = await pool.query(
            `INSERT INTO contacts (
                first_name, last_name, email, phone, company, position,
                address, city, state, country, postal_code, source, status, assigned_to, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                first_name, last_name, email, phone, company, position,
                address, city, state, country, postal_code, source, status || 'active',
                assigned_to, notes, decoded.id
            ]
        );

        const newContact = result.rows[0];
        await logAction('contacts', newContact.id, 'create', decoded.id, newContact);

        return NextResponse.json({
            message: 'Contact created successfully',
            contact: newContact
        }, { status: 201 });
    } catch (error) {
        console.error('Create contact error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
