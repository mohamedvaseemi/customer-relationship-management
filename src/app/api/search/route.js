import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const query = searchParams.get('q');

        if (!query || query.trim() === '') {
            return NextResponse.json({ results: [] });
        }

        const searchTerm = `%${query}%`;
        const results = [];

        // 1. Search Leads
        const leadsRes = await pool.query(
            "SELECT id, title, notes FROM leads WHERE title LIKE $1 OR notes LIKE $2 LIMIT 5",
            [searchTerm, searchTerm]
        );
        leadsRes.rows.forEach(row => {
            results.push({
                type: 'lead',
                title: row.title,
                sub: row.notes || 'Lead details',
                path: `/leads`
            });
        });

        // 2. Search Contacts
        const contactsRes = await pool.query(
            "SELECT id, first_name, last_name, email, company FROM contacts WHERE first_name LIKE $1 OR last_name LIKE $2 OR email LIKE $3 OR company LIKE $4 LIMIT 5",
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );
        contactsRes.rows.forEach(row => {
            results.push({
                type: 'contact',
                title: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
                sub: `${row.email || ''} - ${row.company || ''}`,
                path: `/contacts`
            });
        });

        // 3. Search Deals
        const dealsRes = await pool.query(
            "SELECT id, name, stage FROM deals WHERE name LIKE $1 OR stage LIKE $2 LIMIT 5",
            [searchTerm, searchTerm]
        );
        dealsRes.rows.forEach(row => {
            results.push({
                type: 'deal',
                title: row.name,
                sub: `Stage: ${row.stage || 'discovery'}`,
                path: `/deals`
            });
        });

        // 4. Search Companies
        const companiesRes = await pool.query(
            "SELECT id, name, industry, website FROM companies WHERE name LIKE $1 OR industry LIKE $2 LIMIT 5",
            [searchTerm, searchTerm]
        );
        companiesRes.rows.forEach(row => {
            results.push({
                type: 'company',
                title: row.name,
                sub: `${row.industry || ''} - ${row.website || ''}`,
                path: `/companies`
            });
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search query error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
