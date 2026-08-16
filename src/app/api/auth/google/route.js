import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req) {
    try {
        const { credential } = await req.json();

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;

        // Check if user already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            // User exists -> Log them in normally
            const user = userCheck.rows[0];
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            return NextResponse.json({ token, user, isNewUser: false });
        } else {
            // User DOES NOT exist -> Send data to frontend to complete onboarding
            return NextResponse.json({ 
                isNewUser: true, 
                googleData: { 
                    email, 
                    firstName: given_name, 
                    lastName: family_name, 
                    picture 
                } 
            });
        }
    } catch (error) {
        console.error('Google Auth Error:', error);
        return NextResponse.json({ error: 'Invalid Google token' }, { status: 400 });
    }
}