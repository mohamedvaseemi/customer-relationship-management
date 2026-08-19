import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, firstName, lastName, picture } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required from Google' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Google User';

        // Check if user exists
        let userResult = await pool.query(
            'SELECT id, name, email, role, is_google_login FROM users WHERE LOWER(TRIM(email)) = $1',
            [normalizedEmail]
        );

        let user = userResult.rows[0];
        let isNewUser = false;

        if (!user) {
            // New Google User -> Set is_google_login = TRUE
            const insertResult = await pool.query(
                `INSERT INTO users (name, email, role, is_google_login, password) 
                 VALUES ($1, $2, 'user', TRUE, NULL) 
                 RETURNING id, name, email, role, is_google_login`,
                [fullName, normalizedEmail]
            );
            user = insertResult.rows[0];
            isNewUser = true;
        } else {
            // Existing user -> Ensure is_google_login is updated to TRUE
            if (!user.is_google_login) {
                await pool.query(
                    'UPDATE users SET is_google_login = TRUE WHERE id = $1',
                    [user.id]
                );
                user.is_google_login = true;
            }
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'kibon-crm-secret-key',
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            message: 'Google login successful',
            isNewUser,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        }, { status: 200 });

    } catch (error) {
        console.error('Google Auth Route Error:', error);
        return NextResponse.json({ error: 'Failed to authenticate with Google' }, { status: 500 });
    }
}