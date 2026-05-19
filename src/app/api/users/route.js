import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { verifyAuth, adminOnly } from '@/lib/auth';

// GET all users
export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const users = await pool.query(
            'SELECT id, name, email, role, avatar, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        return NextResponse.json({ users: users.rows });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create user (Admin only)
export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        if (!adminOnly(decoded)) {
            return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password, role } = body;

        // Check user exists
        const existingUsers = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUsers.rows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, avatar, created_at',
            [name, email, hashedPassword, role || 'user']
        );

        return NextResponse.json({ message: 'User created successfully', user: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
