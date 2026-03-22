import { getAnalytics } from '@/lib/controllers/reportController';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const result = await getAnalytics();
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
