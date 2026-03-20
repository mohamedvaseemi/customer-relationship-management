import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/controllers/userController';
import { getAuthUser, isAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        // Return current user's own profile if id matches, or admin can view any
        const { getCurrentUser } = await import('@/lib/controllers/authController');
        const result = await getCurrentUser(params.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req, { params }) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Only admin or the user themselves can update
    if (!isAdmin(user) && String(user.id) !== String(params.id)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const body = await req.json();
        const result = await updateUser(params.id, body);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    const user = getAuthUser(req);
    if (!user || !isAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    try {
        const result = await deleteUser(params.id, user.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
