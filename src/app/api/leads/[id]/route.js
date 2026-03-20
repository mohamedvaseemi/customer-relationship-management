import { getLeadById, updateLead, deleteLead } from '@/lib/controllers/leadController';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const result = await getLeadById(params.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req, { params }) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await req.json();
        const result = await updateLead(params.id, body);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const result = await deleteLead(params.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
