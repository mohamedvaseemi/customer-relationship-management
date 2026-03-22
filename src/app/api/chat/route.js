import { getRooms, getMessages, sendMessage } from '@/lib/controllers/chatController';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('room_id');
    try {
        if (roomId) {
            const result = await getMessages(roomId);
            return Response.json(result);
        } else {
            const result = await getRooms(user.id);
            return Response.json(result);
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await req.json();
        const result = await sendMessage(body, user.id);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
}
