import { getCurrentUser } from '@/lib/controllers/authController';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await getCurrentUser(user.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
