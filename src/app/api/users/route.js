import { getAllUsers, createUser } from '@/lib/controllers/userController';
import { getAuthUser, isAdmin } from '@/lib/auth';

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await getAllUsers();
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const user = getAuthUser(req);
    if (!user || !isAdmin(user)) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const result = await createUser(body);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
