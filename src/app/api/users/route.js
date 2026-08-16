import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth'; // ❌ Removed adminOnly
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {
        const decoded = verifyAuth(req);
        
        // ✅ Direct inline admin check
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied. Admins only.' }, { status: 403 });
        }

        const result = await pool.query(
            'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
        );

        return NextResponse.json({ users: result.rows });
    } catch (error) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: 'Server error fetching users' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        
        // ✅ Direct inline admin check
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied. Admins only.' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password, role, phone } = body;

        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone',
            [name, email, hashedPassword, role || 'user', phone || null]
        );

        return NextResponse.json({ message: 'User created successfully', user: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: 'Server error creating user' }, { status: 500 });
    }
}