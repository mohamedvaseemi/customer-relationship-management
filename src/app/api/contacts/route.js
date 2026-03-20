import { getAllContacts, createContact } from '@/lib/controllers/contactController';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filters = {
        status: searchParams.get('status'),
        source: searchParams.get('source'),
        search: searchParams.get('search')
    };

    try {
        const result = await getAllContacts(filters);
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
        const result = await createContact(body, user.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
