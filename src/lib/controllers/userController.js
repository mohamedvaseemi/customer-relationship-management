import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

const USER_SAFE_FIELDS = 'id, name, email, role, avatar, phone, job_title, department, bio, location, timezone, language, avatar_color, notification_prefs, subscription_tier, created_at, updated_at, last_active_at';

export const createUser = async (data) => {
    const { name, email, password, role, phone, job_title, department } = data;

    const existingUsers = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUsers.rows.length > 0) {
        throw new Error('User already exists with that email address');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
        `INSERT INTO users (name, email, password, role, phone, job_title, department) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING ${USER_SAFE_FIELDS}`,
        [name, email, hashedPassword, role || 'user', phone || null, job_title || null, department || null]
    );

    return { message: 'User created successfully', user: result.rows[0] };
};

export const getAllUsers = async () => {
    const users = await query(
        `SELECT ${USER_SAFE_FIELDS} FROM users ORDER BY created_at DESC`
    );
    return { users: users.rows };
};

export const getUserById = async (id) => {
    const result = await query(
        `SELECT ${USER_SAFE_FIELDS} FROM users WHERE id = $1`,
        [id]
    );
    if (result.rows.length === 0) throw new Error('User not found');
    return { user: result.rows[0] };
};

export const updateUser = async (id, data) => {
    const { name, email, role, password, phone, job_title, department, bio, location, timezone, language, avatar_color, notification_prefs, subscription_tier } = data;
    
    let updateFields = [];
    let updateParams = [];
    let idx = 1;

    const addField = (field, value) => {
        if (value !== undefined) {
            updateFields.push(`${field} = $${idx++}`);
            updateParams.push(value);
        }
    };

    addField('name', name);
    addField('email', email);
    addField('role', role);
    addField('phone', phone);
    addField('job_title', job_title);
    addField('department', department);
    addField('bio', bio);
    addField('location', location);
    addField('timezone', timezone);
    addField('language', language);
    addField('avatar_color', avatar_color);
    addField('subscription_tier', subscription_tier);
    if (notification_prefs !== undefined) {
        updateFields.push(`notification_prefs = $${idx++}`);
        updateParams.push(JSON.stringify(notification_prefs));
    }

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push(`password = $${idx++}`);
        updateParams.push(hashedPassword);
    }

    // Always bump updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
        throw new Error('No fields to update');
    }

    updateParams.push(id);
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING ${USER_SAFE_FIELDS}`;
    const result = await query(updateQuery, updateParams);

    if (result.rows.length === 0) throw new Error('User not found');
    return { message: 'User updated successfully', user: result.rows[0] };
};

export const deleteUser = async (id, currentUserId) => {
    if (parseInt(id) === parseInt(currentUserId)) {
        throw new Error('Cannot delete your own account');
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) throw new Error('User not found');
    return { message: 'User deleted successfully' };
};

export const updateLastActive = async (userId) => {
    await query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [userId]);
};
