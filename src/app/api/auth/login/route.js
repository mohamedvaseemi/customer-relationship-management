import { login } from '@/lib/controllers/authController';

export async function POST(req) {
    try {
        const body = await req.json();
        const result = await login(body);
        return Response.json(result);
    } catch (error) {
        console.error('Login error:', error);
        const status = error.message.includes('Invalid credentials') ? 401 : 500;
        return Response.json({ error: error.message }, { status });
    }
}
