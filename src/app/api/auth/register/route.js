import { register } from '@/lib/controllers/authController';

export async function POST(req) {
    try {
        const body = await req.json();
        const result = await register(body);
        return Response.json(result);
    } catch (error) {
        console.error('Registration error:', error);
        const status = error.message.includes('already exists') ? 409 : 500;
        return Response.json({ error: error.message }, { status });
    }
}
