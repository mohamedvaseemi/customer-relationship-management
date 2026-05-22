import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');

        if (errorParam) {
            console.error('Google OAuth callback error parameter:', errorParam);
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, req.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL('/login?error=missing_authorization_code', req.url));
        }

        const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').replace(/['"]/g, '');
        const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').replace(/['"]/g, '');
        
        if (!clientId || !clientSecret || clientId.includes('your_google_client_id')) {
            console.error('Google credentials missing or placeholders in environment variables');
            return NextResponse.redirect(new URL('/login?error=google_config_missing', req.url));
        }

        // Set up client dynamically based on origin of request
        const redirectUri = `${url.origin}/api/auth/callback/google`;
        const client = new OAuth2Client(clientId, clientSecret, redirectUri);

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId,
        });
        
        const payload = ticket.getPayload();
        if (!payload) {
            return NextResponse.redirect(new URL('/login?error=invalid_google_payload', req.url));
        }

        const { email, name, picture, sub: googleId } = payload;
        let isNewUser = false;

        // Check if user already exists
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            isNewUser = true;
            // Create a new user if they don't exist
            // Generate a secure random password since they use Google SSO
            const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + googleId, 10);
            
            const insertResult = await pool.query(
                'INSERT INTO users (name, email, password, role, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, avatar',
                [name, email, dummyPassword, 'user', picture || null]
            );
            user = insertResult.rows[0];
        } else if (!user.avatar && picture) {
            // Update user's avatar if they don't have one set yet
            await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [picture, user.id]);
            user.avatar = picture;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Render success HTML that sets localStorage and redirects to /dashboard
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authenticating...</title>
          <script>
            try {
              localStorage.setItem('token', ${JSON.stringify(token)});
              localStorage.setItem('user', JSON.stringify(${JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
              })}));
              window.location.href = ${isNewUser ? "'/register?step=2&google=true'" : "'/dashboard'"};
            } catch (e) {
              console.error(e);
              window.location.href = '/login?error=localstorage_failed';
            }
          </script>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background: #0f172a; color: #f8fafc; margin: 0;">
          <div style="text-align: center; padding: 2.5rem; background: rgba(30, 41, 59, 0.7); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); max-width: 420px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); backdrop-filter: blur(12px);">
            <div style="width: 40px; height: 40px; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem auto;"></div>
            <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem 0; letter-spacing: -0.025em;">Authenticating</h2>
            <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Verifying your credentials and loading workspace...</p>
          </div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </body>
        </html>
        `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error('Google OAuth callback handler error:', error);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'auth_failed')}`, req.url));
    }
}
