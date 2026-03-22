import { updateActivity, deleteActivity } from '@/lib/controllers/activityController';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req, { params }) {
    const { id } = await params;
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await req.json();
        const result = await updateActivity(id, body);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const result = await deleteActivity(id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
