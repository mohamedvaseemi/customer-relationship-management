import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const result = await pool.query(
            `SELECT * FROM campaigns ORDER BY created_at DESC`
        );

        return NextResponse.json({ campaigns: result.rows });
    } catch (error) {
        console.error('Get campaigns error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const body = await req.json();
        const { name, type, status, budget, start_date, end_date, description } = body;

        if (!name) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });

        const result = await pool.query(
            `INSERT INTO campaigns (name, type, status, budget, start_date, end_date, description, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                name, type || 'email', status || 'draft', budget || 0, 
                start_date || null, end_date || null, description || null, decoded.id
            ]
        );

        return NextResponse.json({ message: 'Campaign created', campaign: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create campaign error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}