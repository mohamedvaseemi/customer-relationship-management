import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { current_password, new_password } = await req.json();

        if (!current_password || !new_password) {
            return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
        }

        // Get user hashed password
        const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [decoded.id]);
        if (userRes.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const validPassword = await bcrypt.compare(current_password, userRes.rows[0].password);
        if (!validPassword) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashedNew = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNew, decoded.id]);

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}