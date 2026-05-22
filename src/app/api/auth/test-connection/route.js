import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
    try {
        const { backend_url, api_key } = await req.json();

        if (!backend_url) {
            return NextResponse.json({ success: false, error: 'Backend URL is required.' }, { status: 400 });
        }

        await axios.get(backend_url, {
            headers: { 'X-API-Key': api_key || '' },
            timeout: 5000
        });

        return NextResponse.json({ success: true, message: 'Backend connection test succeeded!' });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.response?.data?.error || err.message || 'Backend connection failed.' }, { status: 400 });
    }
}

