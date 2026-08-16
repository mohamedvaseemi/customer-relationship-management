import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, firstName, lastName, accountType, companyName, phone, password, isGoogleAuth } = body;

        // Double check if email somehow got registered in the meantime
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        let hashedPassword = null;
        if (!isGoogleAuth && password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const finalCompanyName = accountType === 'individual' ? 'Independent Developer' : companyName;

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone, role, created_at) 
             VALUES ($1, $2, $3, $4, 'user', CURRENT_TIMESTAMP) RETURNING id, name, email, role`,
            [fullName, email, hashedPassword, phone || null]
        );

        const user = result.rows[0];

        // Generate Login Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({ token, user }, { status: 201 });
    } catch (error) {
        console.error('Onboarding Error:', error);
        return NextResponse.json({ error: 'Server error during onboarding' }, { status: 500 });
    }
}