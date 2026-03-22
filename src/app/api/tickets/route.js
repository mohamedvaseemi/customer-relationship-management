import { getAllTickets, createTicket } from '@/lib/controllers/ticketController';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filters = {
        status: searchParams.get('status'),
        priority: searchParams.get('priority'),
        search: searchParams.get('search')
    };

    try {
        const result = await getAllTickets(filters);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const result = await createTicket(body, user.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
