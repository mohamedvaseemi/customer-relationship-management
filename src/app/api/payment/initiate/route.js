import { NextResponse } from 'next/server';
import { generatePayUHash } from '@/lib/payu';
import { verifyAuth } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(req) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) return NextResponse.json({ error: 'Access denied' }, { status: 401 });

        const { amount, planId, planName, firstname, email, phone } = await req.json();

        if (!amount || !planId) {
            return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
        }

        // 1. Generate Unique TXN ID
        const txnid = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

        // 2. Securely Save Pending Transaction to DB
        await pool.query(
            `INSERT INTO transactions (txnid, user_id, plan_id, amount, status) VALUES ($1, $2, $3, $4, 'pending')`,
            [txnid, decoded.id, planId, amount]
        );

        // 3. Generate PayU Hash
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
        
        const payuData = generatePayUHash({
            txnid,
            amount,
            productinfo: planId, // Using planId as productinfo for tracking
            firstname,
            email,
            udf1: decoded.id.toString(), // Pass User ID
            udf2: planId // Pass Plan ID
        });

        return NextResponse.json({
            ...payuData,
            productinfo: planId,
            firstname,
            email,
            phone: phone,
            surl: `${origin}/api/payment/callback`,
            furl: `${origin}/api/payment/callback`,
            udf1: decoded.id.toString(),
            udf2: planId
        });
    } catch (error) {
        console.error('Initiate Payment Error:', error);
        return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
    }
}