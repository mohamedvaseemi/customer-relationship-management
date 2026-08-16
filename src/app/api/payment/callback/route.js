import { NextResponse } from 'next/server';
import { verifyPayUHash } from '@/lib/payu';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const { isValid } = verifyPayUHash(data);

        // We rely on the Webhook for DB updates. Callback is strictly for UX redirection.
        if (isValid && data.status === 'success') {
            return NextResponse.redirect(`${origin}/billing?status=success&txnid=${data.txnid}`, 303);
        } else {
            return NextResponse.redirect(`${origin}/billing?status=failed&txnid=${data.txnid}`, 303);
        }
    } catch (error) {
        console.error('Callback Redirection Error:', error);
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${origin}/billing?status=error`, 303);
    }
}