import { deleteAutomation } from '@/lib/controllers/automationController';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
    const { id } = await params;
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const result = await deleteAutomation(id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
