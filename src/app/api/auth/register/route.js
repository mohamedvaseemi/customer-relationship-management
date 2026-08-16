import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            name, 
            email, 
            password, 
            isGoogleAuth, 
            accountType, 
            companyName, 
            industry, 
            employeeCount, 
            phone 
        } = body;

        // 1. Basic Validation
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        if (!isGoogleAuth && !password) {
            return NextResponse.json({ error: 'Password is required for manual registration.' }, { status: 400 });
        }

        // 2. Check if email is already registered
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ error: 'Email is already registered. Please sign in.' }, { status: 400 });
        }

        // 3. Conditionally Hash Password (Fixes the "Illegal arguments: object, number" error)
        let hashedPassword = null;
        if (!isGoogleAuth && password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // 4. Insert User
        // Setting default role as 'admin' for the first user of the workspace
        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone, role) 
             VALUES ($1, $2, $3, $4, 'admin') RETURNING id, name, email, role, phone`,
            [name, email, hashedPassword, phone || null]
        );

        const user = result.rows[0];

        // Optional: If you want to store company info later, you can insert it into a companies/settings table here using `companyName`, `industry`, `employeeCount`

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({ message: 'Registration successful', token, user }, { status: 201 });

    } catch (error) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ error: 'Server error during registration. Please try again.' }, { status: 500 });
    }
}