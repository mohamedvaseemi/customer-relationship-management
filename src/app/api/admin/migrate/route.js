import { query } from '@/lib/db';
import { getAuthUser, isAdmin } from '@/lib/auth';

export async function POST(req) {
    const user = getAuthUser(req);
    if (!user || !isAdmin(user)) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await query(`
            ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
                ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
                ADD COLUMN IF NOT EXISTS department VARCHAR(100),
                ADD COLUMN IF NOT EXISTS bio TEXT,
                ADD COLUMN IF NOT EXISTS location VARCHAR(150),
                ADD COLUMN IF NOT EXISTS timezone VARCHAR(80) DEFAULT 'UTC',
                ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
                ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(20) DEFAULT '#6366f1',
                ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email":true,"browser":true,"deals":true,"leads":true}',
                ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
        `);
        return Response.json({ success: true, message: 'User schema migration complete' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
