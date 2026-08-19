import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // 1. Check for empty inputs
        if (!email?.trim()) {
            console.log('🔴 Login Rejected: Missing email');
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // 2. Fetch user with is_google_login flag
        const result = await pool.query(
            'SELECT id, name, email, password, role, is_google_login FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))', 
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // 3. Reject if account is registered via Google
        if (user.is_google_login && !user.password) {
            return NextResponse.json({ 
                error: 'This account uses Google Sign-In. Please click "Sign in with Google".' 
            }, { status: 400 });
        }

        // 4. Verify password for manual accounts
        const isMatch = await bcrypt.compare(String(password), String(user.password));
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'kibon-crm-secret-key',
            { expiresIn: '7d' }
        );

        delete user.password;

        return NextResponse.json({ 
            message: 'Login successful', 
            token, 
            user 
        }, { status: 200 });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
    }
}