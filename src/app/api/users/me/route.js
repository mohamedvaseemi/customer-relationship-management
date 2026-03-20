import { updateUser, getUserById } from '@/lib/controllers/userController';
import { getAuthUser } from '@/lib/auth';

// PATCH /api/users/me — Update own profile
export async function PATCH(req) {
    const authUser = getAuthUser(req);
    if (!authUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        // Disallow role escalation through this endpoint
        delete body.role;
        delete body.password; // Use separate endpoint for password change
        const result = await updateUser(authUser.id, body);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}

// PUT /api/users/me/password — Change own password
export async function PUT(req) {
    const authUser = getAuthUser(req);
    if (!authUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { currentPassword, newPassword } = await req.json();
        if (!currentPassword || !newPassword) {
            return Response.json({ error: 'Both current and new password required' }, { status: 400 });
        }
        const { query } = await import('@/lib/db');
        const bcrypt = await import('bcryptjs');
        const userRow = await query('SELECT password FROM users WHERE id = $1', [authUser.id]);
        const isMatch = await bcrypt.compare(currentPassword, userRow.rows[0]?.password);
        if (!isMatch) return Response.json({ error: 'Current password is incorrect' }, { status: 400 });

        const result = await updateUser(authUser.id, { password: newPassword });
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
