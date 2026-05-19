import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST(req, { params }) {
    try {
        const decoded = verifyAuth(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const { id } = await params;

        await pool.query('UPDATE contacts SET is_deleted = false WHERE id = $1', [id]);
        await logAction('contacts', id, 'restore', decoded.id, { message: 'Contact restored' });

        return NextResponse.json({ message: 'Contact restored successfully' });
    } catch (error) {
        console.error('Restore contact error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
