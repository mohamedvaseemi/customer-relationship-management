import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
    const user = getAuthUser(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { tier } = await req.json();
        
        // In a real production app, you would verify payment via Stripe/Razorpay webhook here
        await query(
            'UPDATE users SET subscription_tier = $1 WHERE id = $2',
            [tier, user.id]
        );

        return Response.json({ 
            success: true, 
            message: `Successfully upgraded to ${tier} plan.` 
        });
    } catch (error) {
        console.error('Subscription update error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
