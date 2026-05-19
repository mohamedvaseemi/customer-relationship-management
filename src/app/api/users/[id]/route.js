import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { verifyAuth, adminOnly } from '@/lib/auth';

// PUT update user
export async function PUT(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, email, role, password } = body;

        let updateFields = ['name = $1', 'email = $2', 'role = $3'];
        let updateParams = [name, email, role];
        let nextParamIndex = 4;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password = $${nextParamIndex}`);
            updateParams.push(hashedPassword);
            nextParamIndex++;
        }

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${nextParamIndex} RETURNING id, name, email, role, avatar`;
        updateParams.push(id);

        const result = await pool.query(updateQuery, updateParams);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        if (!adminOnly(decoded)) {
            return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
        }

        const { id } = await params;

        // Prevent deleting self
        if (parseInt(id) === decoded.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
