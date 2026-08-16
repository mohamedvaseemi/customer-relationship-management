import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth'; // ❌ Removed adminOnly

// PUT update user
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
        }

        const { id } = params;
        
        // ✅ Direct inline admin check
        if (decoded.role !== 'admin' && String(decoded.id) !== String(id)) {
            return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password, phone, role } = body;

        let finalRole = role;
        if (decoded.role !== 'admin') {
            finalRole = decoded.role; // Prevent non-admins from upgrading their role
        }

        let query, values;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = `UPDATE users SET name = $1, email = $2, password = $3, phone = $4, role = $5 WHERE id = $6 RETURNING id, name, email, role, phone`;
            values = [name, email, hashedPassword, phone || null, finalRole || 'user', id];
        } else {
            query = `UPDATE users SET name = $1, email = $2, phone = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role, phone`;
            values = [name, email, phone || null, finalRole || 'user', id];
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: 'Server error updating user' }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        
        // ✅ Direct inline admin check
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied. Admins only.' }, { status: 403 });
        }

        const { id } = params;
        
        if (String(decoded.id) === String(id)) {
            return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Server error deleting user' }, { status: 500 });
    }
}