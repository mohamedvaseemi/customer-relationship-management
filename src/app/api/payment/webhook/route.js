import { NextResponse } from 'next/server';
import { verifyPayUHash } from '@/lib/payu';
import { pool } from '@/lib/db';

export async function POST(req) {
    try {
        const textData = await req.text();
        const params = new URLSearchParams(textData);
        const data = Object.fromEntries(params.entries());

        // 1. Verify Hash securely
        const { isValid } = verifyPayUHash(data);

        if (!isValid) {
            console.error('Webhook: Hash Mismatch. Potential fraud attempt.');
            return NextResponse.json({ status: 'Hash verification failed' }, { status: 400 });
        }

        // 2. Fetch original transaction from DB
        const txnRes = await pool.query('SELECT * FROM transactions WHERE txnid = $1', [data.txnid]);
        if (txnRes.rows.length === 0) {
            return NextResponse.json({ status: 'Transaction not found' }, { status: 404 });
        }

        const txn = txnRes.rows[0];

        // 3. Idempotency Check: Prevent duplicate processing
        if (txn.status === 'success') {
            return NextResponse.json({ status: 'Already processed' }, { status: 200 });
        }

        // 4. Amount Verification (Crucial Security Step)
        if (parseFloat(data.amount) !== parseFloat(txn.amount)) {
            console.error('Webhook: Amount Mismatch!');
            await pool.query('UPDATE transactions SET status = $1 WHERE txnid = $2', ['tampered', data.txnid]);
            return NextResponse.json({ status: 'Amount tampered' }, { status: 400 });
        }

        // 5. Update DB based on status
        if (data.status === 'success') {
            // Update Transaction
            await pool.query(
                'UPDATE transactions SET status = $1, payu_id = $2, updated_at = NOW() WHERE txnid = $3',
                ['success', data.mihpayid, data.txnid]
            );

            // Upgrade User Plan
            await pool.query(
                'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
                ['premium_user', txn.user_id] // Adjust role/plan field based on your schema
            );

            console.log(`Webhook: Payment ${data.txnid} marked successful.`);
        } else {
            await pool.query(
                'UPDATE transactions SET status = $1, updated_at = NOW() WHERE txnid = $2',
                ['failed', data.txnid]
            );
        }

        // PayU expects a 200 OK response for webhooks
        return NextResponse.json({ status: 'OK' }, { status: 200 });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}