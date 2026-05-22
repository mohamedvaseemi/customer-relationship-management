import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db';

export async function POST(req) {
    try {
        const { name, email, password, role, businessDetails, connectionDetails, skipConnection } = await req.json();

        // Check if user exists
        const existingUsers = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUsers.rows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'user']
        );

        const user = result.rows[0];

        // Insert business details and connection details into crm_settings
        const { companyName, industry, website, employeeCount } = businessDetails || {};
        const { backend_url, api_key } = connectionDetails || {};

        await pool.query(
            `INSERT INTO crm_settings (
                company_name, industry, website, employee_count, backend_connected, backend_url, api_key
             ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                companyName || 'My Company',
                industry || '',
                website || '',
                employeeCount ? parseInt(employeeCount) : null,
                skipConnection ? 0 : 1,
                backend_url || '',
                api_key || ''
            ]
        );

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            message: 'User registered successfully',
            token,
            user
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
