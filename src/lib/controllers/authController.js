import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export const register = async (data) => {
    const { name, email, password, role } = data;

    // Check if user exists
    const existingUsers = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (existingUsers.rows.length > 0) {
        throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, role || 'user']
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'MODERN_CRM_SECRET',
        { expiresIn: '7d' }
    );

    return {
        message: 'User registered successfully',
        token,
        user
    };
};

export const login = async (data) => {
    const { email, password } = data;

    // Find user
    const users = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (users.rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = users.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'MODERN_CRM_SECRET',
        { expiresIn: '7d' }
    );

    return {
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            job_title: user.job_title,
            department: user.department,
            bio: user.bio,
            location: user.location,
            timezone: user.timezone,
            language: user.language,
            avatar_color: user.avatar_color || '#6366f1',
            notification_prefs: user.notification_prefs,
            subscription_tier: user.subscription_tier
        }
    };
};

export const getCurrentUser = async (userId) => {
    const users = await query(
        `SELECT id, name, email, role, avatar, phone, job_title, department, bio, location, 
                timezone, language, avatar_color, notification_prefs, subscription_tier, created_at, last_active_at
         FROM users WHERE id = $1`,
        [userId]
    );

    if (users.rows.length === 0) {
        throw new Error('User not found');
    }

    return { user: users.rows[0] };
};
