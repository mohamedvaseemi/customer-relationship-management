import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth, isCompanyAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET: List all employees under the same Company Admin
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch users belonging ONLY to the user's company
        const users = await pool.query(
            `SELECT id, name, email, role, avatar, created_at 
             FROM users 
             WHERE company_id = $1 
             ORDER BY created_at DESC`,
            [decoded.company_id]
        );

        return NextResponse.json({ users: users.rows });
    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST: Company Admin creates a new Employee
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded || !isCompanyAdmin(decoded)) {
            return NextResponse.json({ error: 'Forbidden: Company Admin access required' }, { status: 403 });
        }

        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, company_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, role, company_id, created_at`,
            [name, email, hashedPassword, role || 'user', decoded.company_id]
        );

        return NextResponse.json({
            message: 'Employee user created successfully',
            user: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}