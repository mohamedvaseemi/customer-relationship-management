import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/['"]/g, '');
const client = new OAuth2Client(googleClientId);

export async function POST(req) {
    try {
        const { credential } = await req.json();

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });
        
        const payload = ticket.getPayload();
        
        if (!payload) {
            return NextResponse.json({ error: 'Invalid Google token' }, { status: 400 });
        }

        const { email, name, sub: googleId } = payload;

        // Check if user already exists
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            // Create a new user if they don't exist
            // We use a dummy complex password since they will log in via Google
            const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + googleId, 10);
            
            const insertResult = await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
                [name, email, dummyPassword, 'user']
            );
            user = insertResult.rows[0];
        }

        // Generate our own JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            message: 'Google login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        return NextResponse.json({ error: 'Failed to authenticate with Google' }, { status: 500 });
    }
}
