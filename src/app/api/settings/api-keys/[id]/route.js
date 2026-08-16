import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyAuth} from '@/lib/auth';

export async function PATCH(req, { params }) {
    const user = verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { name, scopes, is_active, expires_in_days } = await req.json();
    const fields = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (scopes !== undefined) { fields.push(`scopes = $${idx++}`); values.push(JSON.stringify(scopes)); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active ? 1 : 0); }
    if (expires_in_days !== undefined) {
        const expiresAt = expires_in_days ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000) : null;
        fields.push(`expires_at = $${idx++}`); values.push(expiresAt);
    }
    if (fields.length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    values.push(id);
    await pool.query(`UPDATE api_keys SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(req, { params }) {
    const user = verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await pool.query(`DELETE FROM api_keys WHERE id = $1`, [id]);
    return NextResponse.json({ success: true }, { status: 200 });
}

