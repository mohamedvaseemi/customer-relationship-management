import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const result = await pool.query('SELECT * FROM crm_settings ORDER BY id DESC LIMIT 1');
        const company = result.rows[0] || {
            company_name: '',
            industry: '',
            website: '',
            employee_count: 0
        };

        return NextResponse.json({ company });
    } catch (error) {
        console.error('Get company settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const body = await req.json();
        const { company_name, industry, website, employee_count } = body;

        if (!company_name) {
            return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
        }

        const existing = await pool.query('SELECT id FROM crm_settings ORDER BY id DESC LIMIT 1');
        let result;

        if (existing.rows.length > 0) {
            result = await pool.query(
                'UPDATE crm_settings SET company_name = $1, industry = $2, website = $3, employee_count = $4 WHERE id = $5 RETURNING *',
                [company_name, industry, website, employee_count ? parseInt(employee_count) : null, existing.rows[0].id]
            );
        } else {
            result = await pool.query(
                'INSERT INTO crm_settings (company_name, industry, website, employee_count) VALUES ($1, $2, $3, $4) RETURNING *',
                [company_name, industry, website, employee_count ? parseInt(employee_count) : null]
            );
        }

        return NextResponse.json({
            message: 'Company settings updated successfully',
            company: result.rows[0]
        });
    } catch (error) {
        console.error('Update company settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
